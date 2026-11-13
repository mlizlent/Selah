import crypto from 'crypto';
import type { Request, Response } from 'express';
import { query } from './db';

export type DbUser = {
  id: string;
  email: string;
  username: string | null;
  role: string;
  password_hash?: string;
  created_at: string;
};

const SESSION_COOKIE = 'selah_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.AUTH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET (or AUTH_SECRET/JWT_SECRET) must be set');
  }
  return secret;
}

function b64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString('base64url');
}

function sign(data: string) {
  return b64url(crypto.createHmac('sha256', getSecret()).update(data).digest());
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64);
  return `scrypt:${b64url(salt)}:${b64url(derived)}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [algo, saltB64, hashB64] = stored.split(':');
    if (algo !== 'scrypt' || !saltB64 || !hashB64) return false;
    const salt = Buffer.from(saltB64, 'base64url');
    const expected = Buffer.from(hashB64, 'base64url');
    const derived = crypto.scryptSync(password, salt, expected.length);
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

type SessionPayload = { uid: string; exp: number };

export function createSessionToken(userId: string): string {
  const payload: SessionPayload = { uid: userId, exp: Date.now() + SESSION_TTL_MS };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload?.uid || !payload?.exp) return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: Response, token: string | null) {
  const secure = process.env.NODE_ENV === 'production';
  if (!token) {
    res.cookie(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: 0 });
    return;
  }
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: SESSION_TTL_MS,
  });
}

export function getTokenFromRequest(req: Request): string | undefined {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice('Bearer '.length).trim();
  const cookies = (req as any).cookies as Record<string, string> | undefined;
  if (cookies?.[SESSION_COOKIE]) return cookies[SESSION_COOKIE];
  const raw = req.headers.cookie;
  if (!raw) return undefined;
  for (const part of raw.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === SESSION_COOKIE) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

export async function getUserById(id: string): Promise<DbUser | null> {
  const { rows } = await query<DbUser>(
    `SELECT u.id, u.email, u.username, COALESCE(p.role, u.role, 'user') AS role, u.created_at
     FROM users u
     LEFT JOIN profiles p ON p.id = u.id
     WHERE u.id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function getUserFromRequest(req: Request): Promise<DbUser | null> {
  const token = getTokenFromRequest(req);
  const payload = verifySessionToken(token);
  if (!payload) return null;
  return getUserById(payload.uid);
}

export function isUserAdmin(user: Pick<DbUser, 'email' | 'role'> | null | undefined): boolean {
  if (!user) return false;
  const shield = (process.env.ADMIN_EMAIL_SHIELD || '').trim().toLowerCase();
  if (shield && user.email?.trim().toLowerCase() === shield) return true;
  return user.role === 'admin' || user.role === 'priestess';
}

export function publicUser(user: DbUser) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    isAdmin: isUserAdmin(user),
  };
}
