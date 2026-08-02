import http from 'http';
import { readFile } from 'fs/promises';
import { pathToFileURL } from 'url';
import { createClient } from '@supabase/supabase-js';

const PORT = Number(process.env.PORT || 5178);
let GROQ_API_KEY = process.env.GROQ_API_KEY;
let GROQ_API_BASE = process.env.GROQ_API_BASE || 'https://api.groq.com/openai/v1';
let ALLOWED_ORIGIN = process.env.DEV_ORIGIN || 'http://localhost:5173';
let supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabaseAdmin = null;

function getSupabaseAdmin() {
  if (!supabaseServiceRoleKey) return null;
  if (!supabaseAdmin) {
    const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    supabaseAdmin = createClient(url, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return supabaseAdmin;
}

async function loadDotEnv() {
  try {
    const envPath = new URL('./.env', import.meta.url);
    const raw = await readFile(envPath, 'utf8');
    const entries = raw.split(/\r?\n/).filter((line) => line.trim() && !line.trim().startsWith('#'));
    for (const entry of entries) {
      const [key, ...rest] = entry.split('=');
      if (!key) continue;
      const value = rest.join('=').trim();
      if (!(key in process.env)) {
        process.env[key] = value.replace(/(^['"]|['"]$)/g, '');
      }
    }
  } catch {
    // no .env file is okay if env vars are already populated
  }
}

export function getAllowedOrigin(origin) {
  if (!origin) {
    return ALLOWED_ORIGIN;
  }

  const normalized = origin.trim();
  if (/^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalized)) {
    return normalized;
  }

  return ALLOWED_ORIGIN;
}

function sendJson(req, res, status, payload) {
  const body = JSON.stringify(payload);
  const origin = Array.isArray(req.headers.origin) ? req.headers.origin[0] : req.headers.origin;
  const allowedOrigin = getAllowedOrigin(origin);

  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

function parseJsonResponse(text) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const first = trimmed.indexOf('{');
    const last = trimmed.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
      return JSON.parse(trimmed.slice(first, last + 1));
    }
    throw error;
  }
}

export function buildPrompt(userText) {
  return `You are a gentle, compassionate Bible-study companion and spiritual guide. The user may be asking about a struggle, a life question, a word, a symbol, a person, a passage, or a theme in Scripture.

Do not use any hard-coded verse list. Use your knowledge of Scripture to answer the user’s prompt directly and suggest relevant Bible verses from memory.\n\nRespond with a JSON object and nothing else. The object must include the following fields exactly:\n- text: a brief empathetic and helpful response that answers the user’s question or concern with warmth and clarity\n- verses: an array of 3 to 5 verse objects, each with reference and text; if you are not confident about a reference, omit it rather than inventing\n- showEscalation: true only if the user expresses crisis, self-harm, harm to others, abuse, or urgent danger\n- isCrisis: true only when the message indicates immediate crisis or danger

When the user asks about Bible study, meanings, symbols, themes, or passages, explain the idea briefly in a simple, thoughtful way and include 2 to 5 relevant verses with a little context when possible. If the user asks about a color, prioritize verses that directly mention that color or a clear color-related object in the verse text rather than loosely related verses. If there is no clear verse match, return an empty verses array and still provide a caring response.

User message: ${userText}`;
}

async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function handleCompanion(req, res) {
  if (!GROQ_API_KEY) {
    return sendJson(req, res, 500, {
      error: 'GROQ_API_KEY is required to run the LLM companion. Set it in the environment or .env file.',
    });
  }

  const rawBody = await readRequestBody(req);
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return sendJson(req, res, 400, { error: 'Invalid JSON body.' });
  }

  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (!text) {
    return sendJson(req, res, 400, { error: 'Missing text field.' });
  }

  const prompt = buildPrompt(text);
  let response;
  try {
    response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
      signal: AbortSignal.timeout(30000),
    });
  } catch (error) {
    console.error('Groq request failed:', error);
    return sendJson(req, res, 502, {
      error: 'The Groq API could not be reached. Check your network connection or Groq API key.',
      detail: error instanceof Error ? error.message : String(error),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    return sendJson(req, res, response.status, {
      error: `Groq request failed: ${errorText}`,
    });
  }

  const data = await response.json();
  const messageText = data.choices?.[0]?.message?.content;
  if (!messageText) {
    return sendJson(req, res, 502, { error: 'Groq returned no completion content.' });
  }

  let parsed;
  try {
    parsed = parseJsonResponse(messageText);
  } catch (error) {
    return sendJson(req, res, 502, {
      error: 'Unable to parse Groq response as JSON.',
      raw: messageText,
    });
  }

  return sendJson(req, res, 200, parsed);
}

async function handleListPosts(req, res) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return sendJson(req, res, 500, { error: 'Server not configured with SUPABASE_SERVICE_ROLE_KEY.' });
  }
  const { data, error } = await admin.from('priestess_posts').select('*').order('created_at', { ascending: false });
  if (error) {
    return sendJson(req, res, 500, { error: error.message });
  }
  return sendJson(req, res, 200, { posts: data });
}

async function handleCreatePost(req, res) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return sendJson(req, res, 500, { error: 'Server not configured with SUPABASE_SERVICE_ROLE_KEY.' });
  }
  const rawBody = await readRequestBody(req);
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return sendJson(req, res, 400, { error: 'Invalid JSON body.' });
  }
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!title || !message) {
    return sendJson(req, res, 400, { error: 'Title and message are required.' });
  }
  const { data, error } = await admin.from('priestess_posts').insert({
    title,
    body: message,
  }).select();
  if (error) {
    return sendJson(req, res, 500, { error: error.message });
  }
  return sendJson(req, res, 201, { post: data[0] });
}

async function handleUpdatePost(req, res, id) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return sendJson(req, res, 500, { error: 'Server not configured with SUPABASE_SERVICE_ROLE_KEY.' });
  }
  const rawBody = await readRequestBody(req);
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return sendJson(req, res, 400, { error: 'Invalid JSON body.' });
  }
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!title || !message) {
    return sendJson(req, res, 400, { error: 'Title and message are required.' });
  }
  const { data, error } = await admin.from('priestess_posts').update({
    title,
    body: message,
  }).eq('id', id).select();
  if (error) {
    return sendJson(req, res, 500, { error: error.message });
  }
  if (!data || data.length === 0) {
    return sendJson(req, res, 404, { error: 'Post not found.' });
  }
  return sendJson(req, res, 200, { post: data[0] });
}

async function handleDeletePost(req, res, id) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return sendJson(req, res, 500, { error: 'Server not configured with SUPABASE_SERVICE_ROLE_KEY.' });
  }
  const { error } = await admin.from('priestess_posts').delete().eq('id', id);
  if (error) {
    return sendJson(req, res, 500, { error: error.message });
  }
  return sendJson(req, res, 204, null);
}

async function main() {
  await loadDotEnv();
  GROQ_API_KEY = process.env.GROQ_API_KEY;
  GROQ_API_BASE = process.env.GROQ_API_BASE || 'https://api.groq.com/openai/v1';
  ALLOWED_ORIGIN = process.env.DEV_ORIGIN || 'http://localhost:5173';

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);

    if (req.method === 'OPTIONS') {
      const origin = Array.isArray(req.headers.origin) ? req.headers.origin[0] : req.headers.origin;
      const allowedOrigin = getAllowedOrigin(origin);
      res.writeHead(204, {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      res.end();
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/companion') {
      await handleCompanion(req, res);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/posts') {
      await handleListPosts(req, res);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/posts') {
      await handleCreatePost(req, res);
      return;
    }

    if (req.method === 'PUT' && url.pathname.match(/^\/api\/posts\/[^\/]+$/)) {
      await handleUpdatePost(req, res, url.pathname.split('/')[3]);
      return;
    }

    if (req.method === 'DELETE' && url.pathname.match(/^\/api\/posts\/[^\/]+$/)) {
      await handleDeletePost(req, res, url.pathname.split('/')[3]);
      return;
    }

    const origin = Array.isArray(req.headers.origin) ? req.headers.origin[0] : req.headers.origin;
    const allowedOrigin = getAllowedOrigin(origin);
    res.writeHead(404, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowedOrigin,
    });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  server.listen(PORT, () => {
    console.log(`LLM companion server running on http://localhost:${PORT}`);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
