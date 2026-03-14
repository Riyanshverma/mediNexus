import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin, supabaseAnon, createUserClient } from '../../config/supabase.js';
import { sendSuccess } from '../../utils/response.js';
import { AppError, UnauthorizedError } from '../../utils/errors.js';
import type { AppMetadata, UserRole } from '../../types/auth.types.js';
import type { LoginBody, RefreshTokenBody } from '../../validators/auth/login.validator.js';

// ─── Login ───────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 *
 * Unified login for patient, hospital_admin, and doctor.
 * Accepts email+password OR phone+password.
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, phone, password } = req.body as LoginBody;

    const signInPayload = email ? { email, password } : { phone: phone as string, password };

    const { data: sessionData, error: signInError } = await supabaseAnon.auth.signInWithPassword(
      signInPayload
    );

    if (signInError || !sessionData.session || !sessionData.user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const user = sessionData.user;
    const session = sessionData.session;
    const appMeta = user.app_metadata as AppMetadata | undefined;
    const role: UserRole | undefined = appMeta?.role;

    sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email ?? null,
          phone: user.phone ?? null,
          role: role ?? null,
        },
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
        },
      },
      'Login successful'
    );
  } catch (err) {
    next(err);
  }
}

// ─── Refresh token ───────────────────────────────────────────────────

/**
 * POST /api/auth/refresh
 *
 * Exchange a refresh_token for a new access_token + refresh_token pair.
 */
export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refresh_token } = req.body as RefreshTokenBody;

    const { data, error } = await supabaseAnon.auth.refreshSession({ refresh_token });

    if (error || !data.session) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    sendSuccess(
      res,
      {
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        },
      },
      'Token refreshed successfully'
    );
  } catch (err) {
    next(err);
  }
}

// ─── Logout ──────────────────────────────────────────────────────────

/**
 * POST /api/auth/logout
 *
 * Invalidates the current session (requires valid Bearer token).
 * Uses a user-scoped client so only the caller's session is revoked.
 */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.headers['authorization']!.slice(7);
    const userClient = createUserClient(token);

    const { error } = await userClient.auth.signOut();

    if (error) {
      throw new AppError('Logout failed. Please try again.', 500);
    }

    sendSuccess(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

// ─── Get current user ────────────────────────────────────────────────

/**
 * GET /api/auth/me
 *
 * Returns the authenticated user along with their role-specific profile.
 */
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const appMeta = user.app_metadata as AppMetadata | undefined;
    const role = appMeta?.role;

    if (!role) {
      throw new AppError('User has no assigned role', 500);
    }

    let profile: Record<string, unknown> | null = null;

    if (role === 'patient') {
      const { data } = await supabaseAdmin
        .from('patients')
        .select('id, full_name, email, phone_number, dob, blood_group, language_preference')
        .eq('user_id', user.id)
        .single();
      profile = data ?? null;
    } else if (role === 'hospital_admin') {
      const { data } = await supabaseAdmin
        .from('hospitals')
        .select('id, name, type, city, state, is_approved')
        .eq('admin_id', user.id)
        .single();
      profile = data ?? null;
    } else if (role === 'doctor') {
      const { data } = await supabaseAdmin
        .from('doctors')
        .select('id, full_name, specialisation, hospital_id, verified')
        .eq('user_id', user.id)
        .single();
      profile = data ?? null;
    }

    sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email ?? null,
          phone: user.phone ?? null,
          role,
        },
        profile,
      },
      'User fetched successfully'
    );
  } catch (err) {
    next(err);
  }
}
