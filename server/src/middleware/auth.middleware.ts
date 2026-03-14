import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import type { UserRole, AppMetadata } from '../types/auth.types.js';

// ─── JWT authentication ──────────────────────────────────────────────

/**
 * Validates the Bearer token from the Authorization header using
 * Supabase's admin client (getUser introspects the JWT server-side).
 * Attaches the Supabase user to req.user on success.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed Authorization header');
    }

    const token = authHeader.slice(7); // strip "Bearer "

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// ─── RBAC guard ──────────────────────────────────────────────────────

/**
 * Factory that returns an Express middleware enforcing role-based access.
 * Call after authenticate() in a route chain.
 *
 * @example
 *   router.post('/invite', authenticate, requireRole('hospital_admin'), handler)
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const appMeta = req.user?.app_metadata as AppMetadata | undefined;
    const role = appMeta?.role;

    if (!role || !roles.includes(role)) {
      next(
        new ForbiddenError(
          `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${role ?? 'none'}`
        )
      );
      return;
    }

    next();
  };
}
