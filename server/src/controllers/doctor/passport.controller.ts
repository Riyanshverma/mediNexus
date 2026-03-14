import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { sendSuccess } from '../../utils/response.js';
import { AppError, ForbiddenError, NotFoundError } from '../../utils/errors.js';
import { requireDoctor } from '../../utils/lookup.js';

/**
 * GET /api/doctors/me/patients/:patientId/passport
 * Returns a patient's health passport if the doctor has a valid access grant.
 * A doctor always has access to records of patients they personally treated
 * (i.e. they issued the prescription or the patient has a grant for their hospital).
 */
export async function getPatientPassportForDoctor(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Authenticated user not found', 401);

    const doctor = await requireDoctor(userId);
    const { patientId } = req.params as { patientId: string };

    // Verify the patient exists
    const { data: patient, error: patientError } = await supabaseAdmin
      .from('patients')
      .select('id, full_name, dob, blood_group, known_allergies, phone_number, email')
      .eq('id', patientId)
      .single();

    if (patientError || !patient) {
      throw new NotFoundError('Patient not found');
    }

    // Check access: doctor issued a prescription OR a valid access grant exists
    const [ownedRxResult, grantResult] = await Promise.all([
      supabaseAdmin
        .from('prescriptions')
        .select('id')
        .eq('doctor_id', doctor.id)
        .eq('patient_id', patientId)
        .limit(1),
      supabaseAdmin
        .from('record_access_grants')
        .select('id')
        .eq('patient_id', patientId)
        .eq('granted_to_hospital_id', doctor.hospital_id)
        .gt('valid_until', new Date().toISOString())
        .limit(1),
    ]);

    const hasOwnRecords = (ownedRxResult.data?.length ?? 0) > 0;
    const hasGrant = (grantResult.data?.length ?? 0) > 0;

    if (!hasOwnRecords && !hasGrant) {
      throw new ForbiddenError(
        'No valid access grant found for this patient. Ask the patient to share their records.'
      );
    }

    // Fetch all data in parallel
    const [prescriptionsResult, reportsResult] = await Promise.all([
      supabaseAdmin
        .from('prescriptions')
        .select(
          `id, appointment_id, doctor_id, patient_id, illness_description, issued_at, pdf_url,
           doctors ( full_name, specialisation ),
           prescription_items (
             id, medicine_id, dosage, frequency, duration, doctor_comment,
             medicines ( medicine_name, composition, therapeutic_class )
           )`
        )
        .eq('patient_id', patientId)
        .order('issued_at', { ascending: false }),
      supabaseAdmin
        .from('patient_reports')
        .select('*, hospitals ( name, city )')
        .eq('patient_id', patientId)
        .order('uploaded_at', { ascending: false }),
    ]);

    if (prescriptionsResult.error) {
      console.error('[getPatientPassportForDoctor] prescriptions query failed:', prescriptionsResult.error.message);
      throw new AppError('Failed to fetch prescriptions', 500);
    }

    sendSuccess(
      res,
      {
        patient,
        prescriptions: prescriptionsResult.data ?? [],
        reports: reportsResult.data ?? [],
      },
      'Patient passport retrieved'
    );
  } catch (err) {
    next(err);
  }
}
