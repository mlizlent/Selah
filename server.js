import express from 'express';
import http from 'http';
import { readFile, writeFile } from 'fs/promises';
import { pathToFileURL } from 'url';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { isAdmin } from '@/middleware/isAdmin';

const app = express();
const PORT = Number(process.env.PORT || 5178);
let GROQ_API_KEY = process.env.GROQ_API_KEY;
let GROQ_API_BASE = process.env.GROQ_API_BASE || 'https://api.groq.com/openai/v1';
let ALLOWED_ORIGIN = process.env.DEV_ORIGIN || 'http://localhost:5173';

const POSTS_FILE = new URL('./posts.json', import.meta.url);

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

function getAllowedOrigin(origin: string | undefined): string {
  if (!origin) {
    return ALLOWED_ORIGIN;
  }

  const normalized = origin.trim();
  if (/^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalized)) {
    return normalized;
  }

  return ALLOWED_ORIGIN;
}

function sendJson(res: express.Response, status: number, payload: unknown) {
  res.status(status).json(payload);
}

function parseJsonResponse(text: string) {
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

export function buildPrompt(userText: string) {
  return `You are a gentle, compassionate Bible-study companion and spiritual guide. The user may be asking about a struggle, a life question, a word, a symbol, a passage, or a theme in Scripture.

Do not use any hard-coded verse list. Use your knowledge of Scripture to answer the user’s prompt directly and suggest relevant Bible verses from memory.\n\nRespond with a JSON object and nothing else. The object must include the following fields exactly:
- text: a brief empathetic and helpful response that answers the user’s question or concern with warmth and clarity
- verses: an array of 3 to 5 verse objects, each with reference and text; if you are not confident about a reference, omit it rather than invent
- showEscalation: true only if the user expresses crisis, self-harm, harm to others, abuse, or urgent danger
- isCrisis: true only when the message indicates immediate crisis or danger

When the user asks about Bible study, meanings, symbols, themes, or passages, explain the idea briefly in a simple, thoughtful way and include 2 to 5 relevant verses with a little context when possible. If the user asks about a color, prioritize verses that directly mention that color or a clear color-related object in the verse text rather than loosely related verses. If there is no clear verse match, return an empty verses array and still provide a caring response.

User message: ${userText}`;
}

async function readRequestBody(req: express.Request): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: Buffer) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function loadPosts() {
  try {
    const raw = await readFile(POSTS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function savePosts(posts: unknown[]) {
  await writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8');
}

app.use(express.json());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigin = getAllowedOrigin(origin);
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.post('/api/companion', async (req, res) => {
  if (!GROQ_API_KEY) {
    return sendJson(res, 500, {
      error: 'GROQ_API_KEY is required to run the LLM companion. Set it in the environment or .env file.',
    });
  }

  const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
  if (!text) {
    return sendJson(res, 400, { error: 'Missing text field.' });
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
    return sendJson(res, 502, {
      error: 'The Groq API could not be reached. Check your network connection or Groq API key.',
      detail: error instanceof Error ? error.message : String(error),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    return sendJson(res, response.status, {
      error: `Groq request failed: ${errorText}`,
    });
  }

  const data = await response.json();
  const messageText = data.choices?.[0]?.message?.content;
  if (!messageText) {
    return sendJson(res, 502, { error: 'Groq returned no completion content.' });
  }

  let parsed;
  try {
    parsed = parseJsonResponse(messageText);
  } catch (error) {
    return sendJson(res, 502, {
      error: 'Unable to parse Groq response as JSON.',
      raw: messageText,
    });
  }

  return sendJson(res, 200, parsed);
});

// Public: read posts
app.get('/api/posts', async (_req, res) => {
  const posts = await loadPosts();
  return sendJson(res, 200, { posts: posts.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) });
});

// Admin only: create post
app.post('/api/posts', isAdmin, async (req, res) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
  if (!title || !message) {
    return sendJson(res, 400, { error: 'Title and message are required.' });
  }
  const posts = await loadPosts();
  const post = {
    id: crypto.randomUUID(),
    title,
    body: message,
    created_at: new Date().toISOString(),
  };
  posts.push(post);
  await savePosts(posts);
  return sendJson(res, 201, { post });
});

// Admin only: update post
app.put('/api/posts/:id', isAdmin, async (req, res) => {
  const id = req.params.id;
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
  if (!title || !message) {
    return sendJson(res, 400, { error: 'Title and message are required.' });
  }
  const posts = await loadPosts();
  const index = posts.findIndex((p: any) => p.id === id);
  if (index === -1) {
    return sendJson(res, 404, { error: 'Post not found.' });
  }
  posts[index] = { ...posts[index], title, body: message };
  await savePosts(posts);
  return sendJson(res, 200, { post: posts[index] });
});

// Admin only: delete post
app.delete('/api/posts/:id', isAdmin, async (req, res) => {
  const id = req.params.id;
  const posts = await loadPosts();
  const index = posts.findIndex((p: any) => p.id === id);
  if (index === -1) {
    return sendJson(res, 404, { error: 'Post not found.' });
  }
  posts.splice(index, 1);
  await savePosts(posts);
  return sendJson(res, 204, null);
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const server = http.createServer(app);

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  loadDotEnv().then(() => {
    GROQ_API_KEY = process.env.GROQ_API_KEY;
    GROQ_API_BASE = process.env.GROQ_API_BASE || 'https://api.groq.com/openai/v1';
    ALLOWED_ORIGIN = process.env.DEV_ORIGIN || 'http://localhost:5173';

    server.listen(PORT, () => {
      console.log(`LLM companion server running on http://localhost:${PORT}`);
    });
  });
}

export default app;
