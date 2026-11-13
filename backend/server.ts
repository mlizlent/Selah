import express from 'express';
import http from 'http';
import path from 'path';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import { access } from 'fs/promises';
import { pathToFileURL } from 'url';
import { readFile } from 'fs/promises';
import { isAdmin } from './src/middleware/isAdmin';
import { query } from './src/server/db';
import {
  createSessionToken,
  getUserById,
  getUserFromRequest,
  hashPassword,
  isUserAdmin,
  publicUser,
  setSessionCookie,
  verifyPassword,
} from './src/server/auth';

const PORT = Number(process.env.PORT || 5178);
let GROQ_API_KEY = process.env.GROQ_API_KEY;
let GROQ_API_BASE = process.env.GROQ_API_BASE || 'https://api.groq.com/openai/v1';
let GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
let ALLOWED_ORIGIN = process.env.DEV_ORIGIN || 'http://localhost:5173';

async function loadDotEnv() {
  try {
    const envPath = new URL('../.env', import.meta.url);
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

export function getAllowedOrigin(origin: string | undefined): string {
  if (!origin) {
    return ALLOWED_ORIGIN;
  }

  const normalized = origin.trim();
  if (/^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalized)) {
    return normalized;
  }

  if (process.env.NODE_ENV === 'production') {
    return normalized;
  }

  return ALLOWED_ORIGIN;
}

function sendJson(res: express.Response, status: number, payload: unknown) {
  res.status(status).json(payload);
}

function parseJsonResponse(text: string) {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^\uFEFF/, '');
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  cleaned = cleaned.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '');
  cleaned = cleaned.trim();

  function attemptParse(input: string): unknown {
    try {
      const parsed = JSON.parse(input);
      if (typeof parsed === 'string') {
        return JSON.parse(parsed);
      }
      return parsed;
    } catch {
      return null;
    }
  }

  const direct = attemptParse(cleaned);
  if (direct !== null) return direct;

  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    const extracted = attemptParse(cleaned.slice(first, last + 1));
    if (extracted !== null) return extracted;
  }

  throw new Error(`No JSON object found in response: ${cleaned.slice(0, 200)}`);
}

export function buildPrompt(userText: string) {
  return `You are Nia, a gentle, compassionate Bible-study companion and spiritual guide. The user may be asking about a struggle, a life question, a word, a symbol, a passage, or a theme in Scripture.

Do not use any hard-coded verse list. Use your knowledge of Scripture to answer the user's prompt directly and suggest relevant Bible verses from memory.\n\nRespond with a JSON object and nothing else. The object must include the following fields exactly:
- text: a substantial, thoughtful response that walks the user through relevant Scripture, explains how it connects to their specific situation, and helps them see what God might be saying to them. Be extensive, warm, and personal — do not give a short or generic reply. Draw out the meaning of the verses, connect them to the user's heart and context, and invite reflection. Break the text into multiple paragraphs using two newlines between each paragraph.
- verses: an array of 3 to 5 verse objects, each with reference, text, and explanation; the explanation should briefly say how that specific verse speaks into the user's situation or condition — make it personal, not generic. In each explanation, use two newlines (blank line) between paragraphs to separate ideas clearly.
- showEscalation: true only if the user expresses crisis, self-harm, harm to others, abuse, or urgent danger
- isCrisis: true only when the message indicates immediate crisis or danger

When the user asks about Bible study, meanings, symbols, themes, or passages, take them deep into the Scripture — explain the background, the heart of the passage, and how it speaks into their specific situation. If the user mentions a feeling, struggle, or question, anchor your response in how the Bible addresses that exact experience. If there is no clear verse match, return an empty verses array and still provide a caring, thoughtful response.

User message: ${userText}`;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function ensureAdminShield(userId: string, email: string) {
  const shield = (process.env.ADMIN_EMAIL_SHIELD || '').trim().toLowerCase();
  if (!shield || email.trim().toLowerCase() !== shield) return;
  await query(`UPDATE users SET role = 'admin' WHERE id = $1`, [userId]);
  await query(
    `INSERT INTO profiles (id, role, username) VALUES ($1, 'admin', 'RoyalDiadem')
     ON CONFLICT (id) DO UPDATE SET role = 'admin'`,
    [userId]
  );
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigin = getAllowedOrigin(origin);
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// ---- Auth ----

app.post('/api/auth/signup', async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : null;
    if (!isValidEmail(email) || password.length < 6) {
      return sendJson(res, 400, { error: 'Valid email and password (min 6 chars) are required.' });
    }
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount) {
      return sendJson(res, 409, { error: 'An account with this email already exists.' });
    }
    const passwordHash = hashPassword(password);
    const shield = (process.env.ADMIN_EMAIL_SHIELD || '').trim().toLowerCase();
    const role = shield && email === shield ? 'admin' : 'user';
    const uname = shield && email === shield ? 'RoyalDiadem' : username;
    const { rows } = await query<{ id: string; email: string; username: string | null; role: string; created_at: string }>(
      `INSERT INTO users (email, password_hash, username, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, username, role, created_at`,
      [email, passwordHash, uname, role]
    );
    const user = rows[0];
    await query(
      `INSERT INTO profiles (id, username, role) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, role = EXCLUDED.role`,
      [user.id, uname, role]
    );
    // Keep it simple: sign in immediately (no email confirmation flow in plain Postgres setup)
    const token = createSessionToken(user.id);
    setSessionCookie(res, token);
    return sendJson(res, 201, { user: publicUser(user as any) });
  } catch (err) {
    console.error('[auth/signup]', err);
    return sendJson(res, 500, { error: 'Failed to create account.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!email || !password) {
      return sendJson(res, 400, { error: 'Email and password are required.' });
    }
    const { rows } = await query<any>(
      `SELECT u.id, u.email, u.username, u.password_hash, COALESCE(p.role, u.role, 'user') AS role, u.created_at
       FROM users u LEFT JOIN profiles p ON p.id = u.id WHERE u.email = $1`,
      [email]
    );
    const user = rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) {
      return sendJson(res, 401, { error: 'Invalid email or password.' });
    }
    await ensureAdminShield(user.id, user.email);
    const refreshed = await getUserById(user.id);
    const token = createSessionToken(user.id);
    setSessionCookie(res, token);
    return sendJson(res, 200, { user: publicUser(refreshed || user) });
  } catch (err) {
    console.error('[auth/login]', err);
    return sendJson(res, 500, { error: 'Failed to sign in.' });
  }
});

app.post('/api/auth/logout', (_req, res) => {
  setSessionCookie(res, null);
  return sendJson(res, 200, { ok: true });
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return sendJson(res, 401, { error: 'Authentication token missing or invalid.' });
    }
    await ensureAdminShield(user.id, user.email);
    const refreshed = (await getUserById(user.id)) || user;
    return sendJson(res, 200, {
      ...publicUser(refreshed),
      username: refreshed.username,
    });
  } catch (err) {
    console.error('[auth/me] unexpected error:', err);
    return sendJson(res, 500, { error: 'Internal security authentication failure.' });
  }
});

app.post('/api/auth/forgot-password', async (_req, res) => {
  // No email service configured in this plain-Postgres setup.
  return sendJson(res, 200, { ok: true, message: 'If an account exists for that email, a reset link will be sent.' });
});

// ---- Prayer requests ----

app.post('/api/prayer-requests', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    const name = typeof req.body.name === 'string' && req.body.name.trim() ? req.body.name.trim() : null;
    const category = typeof req.body.category === 'string' ? req.body.category : 'other';
    const body = typeof req.body.body === 'string' ? req.body.body.trim() : '';
    if (!body) return sendJson(res, 400, { error: 'Request body is required.' });
    const userId = user?.id || null;
    const { rows } = await query(
      `INSERT INTO prayer_requests (name, category, body, user_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, category, body, userId]
    );
    return sendJson(res, 201, { request: rows[0] });
  } catch (err) {
    console.error('[prayer-requests:create]', err);
    return sendJson(res, 500, { error: 'Failed to submit prayer request.' });
  }
});

app.get('/api/prayer-requests/mine', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return sendJson(res, 401, { error: 'Authentication required.' });
    const { rows } = await query(
      `SELECT * FROM prayer_requests WHERE user_id = $1 ORDER BY created_at DESC`,
      [user.id]
    );
    return sendJson(res, 200, { requests: rows });
  } catch (err) {
    console.error('[prayer-requests:mine]', err);
    return sendJson(res, 500, { error: 'Failed to load prayer requests.' });
  }
});

app.get('/api/prayer-requests/:id', async (req, res) => {
  try {
    const { rows } = await query(`SELECT * FROM prayer_requests WHERE id = $1`, [req.params.id]);
    if (!rows[0]) return sendJson(res, 404, { error: 'Not found.' });
    return sendJson(res, 200, { request: rows[0] });
  } catch (err) {
    console.error('[prayer-requests:get]', err);
    return sendJson(res, 500, { error: 'Failed to load prayer request.' });
  }
});

// ---- Appointments ----

app.post('/api/appointments', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    const name = typeof req.body.name === 'string' && req.body.name.trim() ? req.body.name.trim() : null;
    const contact = typeof req.body.contact === 'string' ? req.body.contact.trim() : '';
    const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
    if (!contact || !reason) return sendJson(res, 400, { error: 'Contact and reason are required.' });
    const userId = user?.id || null;
    const { rows } = await query(
      `INSERT INTO appointments (name, contact, reason, user_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, contact, reason, userId]
    );
    return sendJson(res, 201, { appointment: rows[0] });
  } catch (err) {
    console.error('[appointments:create]', err);
    return sendJson(res, 500, { error: 'Failed to submit appointment.' });
  }
});

app.get('/api/appointments/mine', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return sendJson(res, 401, { error: 'Authentication required.' });
    const { rows } = await query(
      `SELECT * FROM appointments WHERE user_id = $1 ORDER BY created_at DESC`,
      [user.id]
    );
    return sendJson(res, 200, { appointments: rows });
  } catch (err) {
    console.error('[appointments:mine]', err);
    return sendJson(res, 500, { error: 'Failed to load appointments.' });
  }
});

// ---- Testimonies ----

app.get('/api/testimonies', async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM testimonies WHERE approved = true ORDER BY created_at DESC`
    );
    return sendJson(res, 200, { testimonies: rows });
  } catch (err) {
    console.error('[testimonies:list]', err);
    return sendJson(res, 500, { error: 'Failed to load testimonies.' });
  }
});

app.post('/api/testimonies', async (req, res) => {
  try {
    const author_name = typeof req.body.author_name === 'string' && req.body.author_name.trim() ? req.body.author_name.trim() : null;
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const body = typeof req.body.body === 'string' ? req.body.body.trim() : '';
    if (!title || !body) return sendJson(res, 400, { error: 'Title and body are required.' });
    const { rows } = await query(
      `INSERT INTO testimonies (author_name, title, body, approved)
       VALUES ($1, $2, $3, false) RETURNING *`,
      [author_name, title, body]
    );
    return sendJson(res, 201, { testimony: rows[0] });
  } catch (err) {
    console.error('[testimonies:create]', err);
    return sendJson(res, 500, { error: 'Failed to submit testimony.' });
  }
});

// ---- Priestess posts (DB-backed) ----

app.get('/api/posts', async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, title, body, created_at FROM priestess_posts ORDER BY created_at DESC`
    );
    return sendJson(res, 200, { posts: rows });
  } catch (err) {
    console.error('[posts:list]', err);
    return sendJson(res, 500, { error: 'Failed to load posts.' });
  }
});

app.post('/api/posts', isAdmin, async (req, res) => {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : (typeof req.body.body === 'string' ? req.body.body.trim() : '');
    if (!title || !message) {
      return sendJson(res, 400, { error: 'Title and message are required.' });
    }
    const { rows } = await query(
      `INSERT INTO priestess_posts (title, body) VALUES ($1, $2) RETURNING id, title, body, created_at`,
      [title, message]
    );
    return sendJson(res, 201, { post: rows[0] });
  } catch (err) {
    console.error('[posts:create]', err);
    return sendJson(res, 500, { error: 'Failed to create post.' });
  }
});

app.put('/api/posts/:id', isAdmin, async (req, res) => {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : (typeof req.body.body === 'string' ? req.body.body.trim() : '');
    if (!title || !message) {
      return sendJson(res, 400, { error: 'Title and message are required.' });
    }
    const { rows } = await query(
      `UPDATE priestess_posts SET title = $1, body = $2 WHERE id = $3 RETURNING id, title, body, created_at`,
      [title, message, req.params.id]
    );
    if (!rows[0]) return sendJson(res, 404, { error: 'Post not found.' });
    return sendJson(res, 200, { post: rows[0] });
  } catch (err) {
    console.error('[posts:update]', err);
    return sendJson(res, 500, { error: 'Failed to update post.' });
  }
});

app.delete('/api/posts/:id', isAdmin, async (req, res) => {
  try {
    const { rowCount } = await query(`DELETE FROM priestess_posts WHERE id = $1`, [req.params.id]);
    if (!rowCount) return sendJson(res, 404, { error: 'Post not found.' });
    return res.sendStatus(204);
  } catch (err) {
    console.error('[posts:delete]', err);
    return sendJson(res, 500, { error: 'Failed to delete post.' });
  }
});

// ---- Admin: dashboard data & mutations ----

app.get('/api/admin/dashboard', isAdmin, async (_req, res) => {
  try {
    const [prayers, appts, tests, posts] = await Promise.all([
      query(`SELECT * FROM prayer_requests ORDER BY created_at DESC`),
      query(`SELECT * FROM appointments ORDER BY created_at DESC`),
      query(`SELECT * FROM testimonies ORDER BY created_at DESC`),
      query(`SELECT id, title, body, created_at FROM priestess_posts ORDER BY created_at DESC`),
    ]);
    return sendJson(res, 200, {
      prayerRequests: prayers.rows,
      appointments: appts.rows,
      testimonies: tests.rows,
      posts: posts.rows,
    });
  } catch (err) {
    console.error('[admin:dashboard]', err);
    return sendJson(res, 500, { error: 'Failed to load dashboard.' });
  }
});

app.patch('/api/admin/prayer-requests/:id', isAdmin, async (req, res) => {
  try {
    const status = typeof req.body.status === 'string' ? req.body.status : null;
    const prayedNote = typeof req.body.prayed_note === 'string' ? req.body.prayed_note : (req.body.prayed_note === null ? null : undefined);
    if (!status || !['pending', 'praying', 'prayed'].includes(status)) {
      return sendJson(res, 400, { error: 'Valid status required.' });
    }
    const prayedAt = status === 'prayed' ? new Date().toISOString() : null;
    const { rows } = await query(
      `UPDATE prayer_requests
       SET status = $1,
           prayed_at = CASE WHEN $1 = 'prayed' THEN COALESCE(prayed_at, $2::timestamptz) ELSE NULL END,
           prayed_note = CASE WHEN $1 = 'prayed' THEN COALESCE($3, prayed_note) ELSE prayed_note END
       WHERE id = $4 RETURNING *`,
      [status, prayedAt, prayedNote ?? null, req.params.id]
    );
    if (!rows[0]) return sendJson(res, 404, { error: 'Not found.' });
    return sendJson(res, 200, { request: rows[0] });
  } catch (err) {
    console.error('[admin:prayer-update]', err);
    return sendJson(res, 500, { error: 'Failed to update prayer request.' });
  }
});

app.patch('/api/admin/appointments/:id', isAdmin, async (req, res) => {
  try {
    const status = typeof req.body.status === 'string' ? req.body.status : null;
    if (!status || !['pending', 'scheduled', 'completed'].includes(status)) {
      return sendJson(res, 400, { error: 'Valid status required.' });
    }
    const { rows } = await query(
      `UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!rows[0]) return sendJson(res, 404, { error: 'Not found.' });
    return sendJson(res, 200, { appointment: rows[0] });
  } catch (err) {
    console.error('[admin:appt-update]', err);
    return sendJson(res, 500, { error: 'Failed to update appointment.' });
  }
});

app.patch('/api/admin/testimonies/:id', isAdmin, async (req, res) => {
  try {
    const approved = req.body.approved === true;
    const { rows } = await query(
      `UPDATE testimonies SET approved = $1 WHERE id = $2 RETURNING *`,
      [approved, req.params.id]
    );
    if (!rows[0]) return sendJson(res, 404, { error: 'Not found.' });
    return sendJson(res, 200, { testimony: rows[0] });
  } catch (err) {
    console.error('[admin:testimony-update]', err);
    return sendJson(res, 500, { error: 'Failed to update testimony.' });
  }
});

app.delete('/api/admin/testimonies/:id', isAdmin, async (req, res) => {
  try {
    const { rowCount } = await query(`DELETE FROM testimonies WHERE id = $1`, [req.params.id]);
    if (!rowCount) return sendJson(res, 404, { error: 'Not found.' });
    return res.sendStatus(204);
  } catch (err) {
    console.error('[admin:testimony-delete]', err);
    return sendJson(res, 500, { error: 'Failed to delete testimony.' });
  }
});

app.post('/api/admin/clear-all', isAdmin, async (_req, res) => {
  try {
    await query(`DELETE FROM prayer_requests`);
    await query(`DELETE FROM appointments`);
    await query(`DELETE FROM testimonies`);
    await query(`DELETE FROM priestess_posts`);
    await query(`DELETE FROM profiles WHERE role NOT IN ('admin','priestess')`);
    await query(`DELETE FROM users WHERE role NOT IN ('admin','priestess')`);
    return sendJson(res, 200, { success: true, message: 'All data cleared successfully.' });
  } catch (error) {
    console.error('Clear all error:', error);
    return sendJson(res, 500, { error: 'Failed to clear data.' });
  }
});

app.post('/api/admin/clear-prayer-requests', isAdmin, async (_req, res) => {
  try {
    await query(`DELETE FROM prayer_requests`);
    return sendJson(res, 200, { success: true, message: 'Prayer queue cleared.' });
  } catch (error) {
    console.error('Clear prayer requests error:', error);
    return sendJson(res, 500, { error: 'Failed to clear prayer requests.' });
  }
});

app.post('/api/admin/clear-appointments', isAdmin, async (_req, res) => {
  try {
    await query(`DELETE FROM appointments`);
    return sendJson(res, 200, { success: true, message: 'Appointments cleared.' });
  } catch (error) {
    console.error('Clear appointments error:', error);
    return sendJson(res, 500, { error: 'Failed to clear appointments.' });
  }
});

app.post('/api/admin/clear-testimonies', isAdmin, async (_req, res) => {
  try {
    await query(`DELETE FROM testimonies`);
    return sendJson(res, 200, { success: true, message: 'All testimonies cleared successfully.' });
  } catch (error) {
    console.error('Clear testimonies error:', error);
    return sendJson(res, 500, { error: 'Failed to clear testimonies.' });
  }
});

app.post('/api/admin/clear-posts', isAdmin, async (_req, res) => {
  try {
    await query(`DELETE FROM priestess_posts`);
    return sendJson(res, 200, { success: true, message: 'All posts cleared successfully.' });
  } catch (error) {
    console.error('Clear posts error:', error);
    return sendJson(res, 500, { error: 'Failed to clear posts.' });
  }
});

// ---- Companion (LLM) ----

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
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
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
    console.error('[companion] parseJsonResponse failed:', error, 'raw:', messageText.slice(0, 500));
    return sendJson(res, 502, {
      error: 'Unable to parse Groq response as JSON.',
      raw: messageText,
    });
  }

  return sendJson(res, 200, parsed);
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const DIST_DIR =
  process.env.DIST_DIR ||
  path.resolve(process.cwd(), 'frontend/dist');
const server = http.createServer(app);

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  loadDotEnv().then(async () => {
    GROQ_API_KEY = process.env.GROQ_API_KEY;
    GROQ_API_BASE = process.env.GROQ_API_BASE || 'https://api.groq.com/openai/v1';
    GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
    ALLOWED_ORIGIN = process.env.DEV_ORIGIN || 'http://localhost:5173';

    console.log('[server] DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    console.log('[server] ADMIN_EMAIL_SHIELD:', process.env.ADMIN_EMAIL_SHIELD || 'NOT SET');
    console.log('[server] GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'SET' : 'NOT SET');
    console.log('[server] GROQ_MODEL:', GROQ_MODEL);

    const hasDist = await access(DIST_DIR).then(() => true).catch(() => false);
    if (hasDist) {
      app.use(express.static(DIST_DIR));
      app.use((_req, res) => {
        res.sendFile(path.join(DIST_DIR, 'index.html'));
      });
    }
  }).catch((err) => {
    console.error('[server] startup error:', err);
  });
}

export default app;
