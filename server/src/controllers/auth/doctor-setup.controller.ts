import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin, supabaseAnon } from '../../config/supabase.js';
import { sendSuccess } from '../../utils/response.js';
import { AppError, ForbiddenError } from '../../utils/errors.js';
import type { AppMetadata } from '../../types/auth.types.js';
import type { DoctorSetupBody } from '../../validators/auth/doctor-setup.validator.js';

/**
 * POST /api/auth/doctor/setup
 *
 * Called by a doctor who clicked the invite email link.
 * The frontend extracts the access_token from the URL hash (#access_token=...)
 * and passes it as a Bearer token.
 *
 * Flow:
 *  1. authenticate middleware already validates the token + sets req.user
 *  2. Confirm the user's role is 'doctor'
 *  3. Set the new password via admin updateUserById
 *  4. Mark verified: true in the doctors table
 *  5. Optionally update full_name if provided
 *  6. Sign in with email+password to return a fresh session
 */
export async function doctorSetup(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user;
    if (!user) throw new AppError('Authenticated user not found', 401);

    // ── 1. Role guard ─────────────────────────────────────────────────
    const appMeta = user.app_metadata as AppMetadata | undefined;
    if (appMeta?.role !== 'doctor') {
      throw new ForbiddenError('Only invited doctors can call this endpoint');
    }

    const { password, full_name } = req.body as DoctorSetupBody;

    // ── 2. Set password ───────────────────────────────────────────────
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password,
    });

    if (passwordError) {
      throw new AppError(`Failed to set password: ${passwordError.message}`, 500);
    }

    // ── 3. Build doctor profile update ────────────────────────────────
    const profileUpdate: { verified: boolean; full_name?: string } = { verified: true };
    if (full_name) {
      profileUpdate.full_name = full_name;
    }

    const { error: profileError } = await supabaseAdmin
      .from('doctors')
      .update(profileUpdate)
      .eq('user_id', user.id);

    if (profileError) {
      console.error('[doctorSetup] doctor profile update failed:', profileError.message);
      throw new AppError(`Failed to update doctor profile: ${profileError.message}`, 500);
    }

    // ── 4. Sign in to return a fresh session ──────────────────────────
    // We need the email to sign in. Fetch it from the admin user record.
    const { data: userData, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(
      user.id
    );

    if (fetchError || !userData.user?.email) {
      throw new AppError('Unable to retrieve doctor email for sign-in', 500);
    }

    const { data: sessionData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email: userData.user.email,
      password,
    });

    if (signInError || !sessionData.session) {
      throw new AppError(`Sign-in after setup failed: ${signInError?.message ?? 'No session returned'}`, 500);
    }

    const session = sessionData.session;

    sendSuccess(
      res,
      {
        tokens: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
        },
        user: {
          id: user.id,
          email: userData.user.email,
          role: 'doctor',
        },
      },
      'Doctor account setup complete',
      200
    );
  } catch (err) {
    next(err);
  }
}
