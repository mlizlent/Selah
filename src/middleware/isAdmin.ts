import { Request, Response, NextFunction } from 'express';
import { getSupabaseAdmin } from '../lib/supabaseAdmin';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: string;
      };
    }
  }
}

function getCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.cookie;
  if (!raw) return undefined;
  const cookies = raw.split('; ');
  for (const cookie of cookies) {
    const idx = cookie.indexOf('=');
    if (idx === -1) continue;
    const key = cookie.slice(0, idx);
    if (key === name) {
      const value = cookie.slice(idx + 1);
      console.log('[isAdmin] cookie', name, 'found, length:', value.length);
      return value;
    }
  }
  console.log('[isAdmin] cookie', name, 'not found');
  return undefined;
}

export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getCookie(req, 'sb-access-token');
    if (!token) {
      return res.status(401).json({ error: 'Authentication token missing or invalid.' });
    }

    const admin = await getSupabaseAdmin();
    if (!admin) {
      return res.status(500).json({ error: 'Server misconfigured.' });
    }

    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: 'Session expired or invalid user token.' });
    }

    const user = data.user;
    const masterAdminEmail = (process.env.ADMIN_EMAIL_SHIELD || '').trim().toLowerCase();

    if (masterAdminEmail && user.email?.trim().toLowerCase() === masterAdminEmail) {
      req.user = {
        id: user.id,
        email: user.email || undefined,
        role: 'admin',
      };
      return next();
    }

    const profileResult = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    type Profile = { role: string };
    const profile = profileResult.data as Profile | null;

    if (profile && (profile.role === 'priestess' || profile.role === 'admin')) {
      req.user = {
        id: user.id,
        email: user.email || undefined,
        role: profile.role,
      };
      return next();
    }

    return res.status(403).json({ error: 'Access denied. Insufficient administrative privileges.' });
  } catch {
    return res.status(500).json({ error: 'Internal security authentication failure.' });
  }
}
