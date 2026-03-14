import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { sendSuccess } from '../../utils/response.js';
import { AppError, NotFoundError, BadRequestError } from '../../utils/errors.js';
import { requireHospital } from '../../utils/lookup.js';

// Allowed updatable fields for a doctor by hospital admin
interface UpdateDoctorByAdminBody {
  full_name?: string;
  specialisation?: string;
  verified?: boolean;
}

/**
 * GET /api/hospitals/me/doctors
 * Lists all doctors belonging to this hospital.
 */
export async function listHospitalDoctors(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminId = req.user?.id;
    if (!adminId) throw new AppError('Authenticated user not found', 401);

    const hospital = await requireHospital(adminId);

    const { data, error } = await supabaseAdmin
      .from('doctors')
      .select('id, user_id, hospital_id, full_name, specialisation, verified, created_at')
      .eq('hospital_id', hospital.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[listHospitalDoctors] query failed:', error.message);
      throw new AppError('Failed to fetch doctors', 500);
    }

    sendSuccess(res, { doctors: data ?? [] }, 'Doctors retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/hospitals/me/doctors/:doctorId
 * Allows hospital admin to update full_name, specialisation, or verified status.
 */
export async function updateHospitalDoctor(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const adminId = req.user?.id;
    if (!adminId) throw new AppError('Authenticated user not found', 401);

    const hospital = await requireHospital(adminId);
    const { doctorId } = req.params as { doctorId: string };

    const body = req.body as UpdateDoctorByAdminBody;

    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestError('At least one field must be provided');
    }

    // Ensure doctor belongs to this hospital
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('doctors')
      .select('id, hospital_id')
      .eq('id', doctorId)
      .eq('hospital_id', hospital.id)
      .single();

    if (fetchError || !existing) {
      throw new NotFoundError('Doctor not found in your hospital');
    }

    // Only allow these fields
    const allowedUpdate: UpdateDoctorByAdminBody = {};
    if (body.full_name !== undefined) allowedUpdate.full_name = body.full_name;
    if (body.specialisation !== undefined) allowedUpdate.specialisation = body.specialisation;
    if (body.verified !== undefined) allowedUpdate.verified = body.verified;

    const { data, error } = await supabaseAdmin
      .from('doctors')
      .update(allowedUpdate)
      .eq('id', doctorId)
      .select()
      .single();

    if (error || !data) {
      console.error('[updateHospitalDoctor] update failed:', error?.message);
      throw new AppError('Failed to update doctor', 500);
    }

    sendSuccess(res, { doctor: data }, 'Doctor updated');
  } catch (err) {
    next(err);
  }
}
