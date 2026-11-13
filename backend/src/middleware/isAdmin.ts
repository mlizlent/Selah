import type { Request, Response, NextFunction } from 'express';
import { getUserFromRequest, isUserAdmin } from '../server/auth';

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
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication token missing or invalid.' });
    }
    if (!isUserAdmin(user)) {
      return res.status(403).json({ error: 'Access denied. Insufficient administrative privileges.' });
    }
    req.user = { id: user.id, email: user.email, role: user.role };
    return next();
  } catch {
    return res.status(500).json({ error: 'Internal security authentication failure.' });
  }
}
