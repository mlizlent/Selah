import { Request, Response, NextFunction } from 'express';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

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

export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization token' });
  }

  const token = authHeader.split(' ')[1];
  const admin = await getSupabaseAdmin();
  if (!admin) {
    return res.status(500).json({ error: 'Server misconfigured: missing SUPABASE_SERVICE_ROLE_KEY' });
  }

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const user = data.user;

  // Hardcoded admin bypass
  if (user.email === 'lizwasonga36@gmail.com') {
    req.user = {
      id: user.id,
      email: user.email || undefined,
      role: 'admin',
    };
    return next();
  }

  // Fallback: check profiles table for priestess or admin role
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

  return res.status(403).json({ error: 'Forbidden: admin access required' });
}
