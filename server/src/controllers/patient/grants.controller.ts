import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { sendSuccess } from '../../utils/response.js';
import { AppError, NotFoundError, BadRequestError, ConflictError } from '../../utils/errors.js';
import { requirePatient } from '../../utils/lookup.js';

interface CreateGrantBody {
  hospital_id: string;
  record_types?: string[];
  duration_days?: number;
}

/**
 * GET /api/patients/me/grants
 * Lists all active (non-expired) record access grants.
 */
export async function listAccessGrants(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Authenticated user not found', 401);

    const patient = await requirePatient(userId);

    const { data, error } = await supabaseAdmin
      .from('record_access_grants')
      .select(
        `id, patient_id, granted_to_hospital_id, record_types, valid_until, created_at`
      )
      .eq('patient_id', patient.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[listAccessGrants] query failed:', error.message);
      throw new AppError('Failed to fetch access grants', 500);
    }

    // Enrich with hospital names
    const grants = data ?? [];
    const hospitalIds = [...new Set(grants.map((g: any) => g.granted_to_hospital_id).filter(Boolean))];

    let hospitalMap: Record<string, { name: string; city: string }> = {};
    if (hospitalIds.length > 0) {
      const { data: hospitals } = await supabaseAdmin
        .from('hospitals')
        .select('id, name, city')
        .in('id', hospitalIds as string[]);
      if (hospitals) {
        for (const h of hospitals) {
          hospitalMap[h.id] = { name: h.name, city: h.city };
        }
      }
    }

    const enriched = grants.map((g: any) => ({
      ...g,
      hospital: g.granted_to_hospital_id ? hospitalMap[g.granted_to_hospital_id] ?? null : null,
      is_active: new Date(g.valid_until) > new Date(),
    }));

    sendSuccess(res, { grants: enriched }, 'Access grants retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/patients/me/grants
 * Creates a new time-limited access grant for a hospital.
 */
export async function createAccessGrant(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Authenticated user not found', 401);

    const patient = await requirePatient(userId);
    const {
      hospital_id,
      record_types = ['prescriptions', 'reports'],
      duration_days = 30,
    } = req.body as CreateGrantBody;

    if (!hospital_id) throw new BadRequestError('hospital_id is required');
    if (duration_days < 1 || duration_days > 365) {
      throw new BadRequestError('duration_days must be between 1 and 365');
    }

    // Verify hospital exists and is approved
    const { data: hospital, error: hospitalError } = await supabaseAdmin
      .from('hospitals')
      .select('id, name')
      .eq('id', hospital_id)
      .eq('is_approved', true)
      .single();

    if (hospitalError || !hospital) {
      throw new NotFoundError('Hospital not found or not approved');
    }

    // Check for existing active grant
    const { data: existingGrant } = await supabaseAdmin
      .from('record_access_grants')
      .select('id, valid_until')
      .eq('patient_id', patient.id)
      .eq('granted_to_hospital_id', hospital_id)
      .gt('valid_until', new Date().toISOString())
      .maybeSingle();

    if (existingGrant) {
      throw new ConflictError(
        `An active grant already exists for this hospital, valid until ${new Date(existingGrant.valid_until).toLocaleDateString()}`
      );
    }

    const validUntil = new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin
      .from('record_access_grants')
      .insert({
        patient_id: patient.id,
        granted_to_hospital_id: hospital_id,
        record_types,
        valid_until: validUntil,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      console.error('[createAccessGrant] insert failed:', error?.message);
      throw new AppError('Failed to create access grant', 500);
    }

    sendSuccess(
      res,
      { grant: { ...data, hospital } },
      `Records shared with ${hospital.name} for ${duration_days} days`,
      201
    );
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/patients/me/grants/:grantId
 * Revokes an access grant immediately.
 */
export async function revokeAccessGrant(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Authenticated user not found', 401);

    const patient = await requirePatient(userId);
    const { grantId } = req.params as { grantId: string };

    // Verify grant belongs to this patient
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('record_access_grants')
      .select('id, patient_id')
      .eq('id', grantId)
      .eq('patient_id', patient.id)
      .single();

    if (fetchError || !existing) {
      throw new NotFoundError('Access grant not found');
    }

    const { error } = await supabaseAdmin
      .from('record_access_grants')
      .delete()
      .eq('id', grantId);

    if (error) {
      console.error('[revokeAccessGrant] delete failed:', error.message);
      throw new AppError('Failed to revoke access grant', 500);
    }

    sendSuccess(res, null, 'Access grant revoked');
  } catch (err) {
    next(err);
  }
}
