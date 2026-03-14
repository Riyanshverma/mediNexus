import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { sendSuccess } from '../../utils/response.js';
import { AppError } from '../../utils/errors.js';
import { requirePatient } from '../../utils/lookup.js';

/**
 * GET /api/patients/me/passport
 * Returns the patient's full health passport:
 *  - prescriptions (all, from all hospitals)
 *  - reports (all)
 *  - profile (blood group, allergies, ongoing meds)
 */
export async function getPatientPassport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Authenticated user not found', 401);

    const patient = await requirePatient(userId);

    // Run all three queries in parallel
    const [prescriptionsResult, reportsResult, grantsResult] = await Promise.all([
      supabaseAdmin
        .from('prescriptions')
        .select(
          `id, appointment_id, doctor_id, patient_id, illness_description, issued_at, pdf_url,
           doctors ( full_name, specialisation, hospitals ( name, city ) ),
           prescription_items (
             id, medicine_id, dosage, frequency, duration, doctor_comment,
             medicines ( medicine_name, composition, therapeutic_class, uses )
           )`
        )
        .eq('patient_id', patient.id)
        .order('issued_at', { ascending: false }),
      supabaseAdmin
        .from('patient_reports')
        .select('*, hospitals ( name, city )')
        .eq('patient_id', patient.id)
        .order('uploaded_at', { ascending: false }),
      supabaseAdmin
        .from('record_access_grants')
        .select('id, granted_to_hospital_id, record_types, valid_until, created_at, hospitals!record_access_grants_granted_to_hospital_id_fkey ( name, city )')
        .eq('patient_id', patient.id)
        .gt('valid_until', new Date().toISOString()),
    ]);

    if (prescriptionsResult.error) {
      console.error('[getPatientPassport] prescriptions query failed:', prescriptionsResult.error.message);
      throw new AppError('Failed to fetch prescriptions', 500);
    }

    sendSuccess(
      res,
      {
        profile: patient,
        prescriptions: prescriptionsResult.data ?? [],
        reports: reportsResult.data ?? [],
        active_grants: grantsResult.data ?? [],
      },
      'Health passport retrieved'
    );
  } catch (err) {
    next(err);
  }
}
