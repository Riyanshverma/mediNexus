import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { sendSuccess } from '../../utils/response.js';
import { AppError, NotFoundError, BadRequestError } from '../../utils/errors.js';
import { requireDoctor } from '../../utils/lookup.js';

// ─── Types ───────────────────────────────────────────────────────────

interface PrescriptionItemInput {
  medicine_id: string;
  dosage: string;
  frequency: string;
  duration: string;
  doctor_comment?: string;
}

interface CreatePrescriptionBody {
  illness_description?: string;
  items: PrescriptionItemInput[];
}

/**
 * GET /api/doctors/me/medicines/search?q=<term>
 * Ranked full-text search on medicines using a GIN-indexed tsvector column.
 * Falls back to direct text search / ilike when the SQL RPC is unavailable.
 */
export async function searchMedicines(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const q = (req.query['q'] as string | undefined)?.trim();
    if (!q || q.length < 2) {
      throw new BadRequestError('Query parameter q must be at least 2 characters');
    }

    const { data: rpcData, error: rpcError } = await (supabaseAdmin as any).rpc(
      'search_medicines',
      { p_query: q, p_limit: 25 }
    );

    if (!rpcError) {
      sendSuccess(res, { medicines: rpcData ?? [] }, 'Medicines retrieved');
      return;
    }

    console.warn('[searchMedicines] RPC search failed, falling back to direct FTS:', rpcError.message);

    // Fallback: FTS directly on tsvector column
    const { data: ftsData, error: ftsError } = await supabaseAdmin
      .from('medicines')
      .select('id, medicine_name, composition, therapeutic_class, chemical_class, uses, side_effects, substitutes, description, image_url')
      .textSearch('search_vector', q, { type: 'websearch', config: 'english' })
      .limit(25);

    // If FTS also fails, fall back to ilike
    if (ftsError) {
      console.warn('[searchMedicines] FTS failed, falling back to ilike:', ftsError.message);
      const { data, error } = await supabaseAdmin
        .from('medicines')
        .select('id, medicine_name, composition, therapeutic_class, chemical_class, uses, side_effects, substitutes, description, image_url')
        .or(`medicine_name.ilike.%${q}%,uses.ilike.%${q}%,description.ilike.%${q}%,therapeutic_class.ilike.%${q}%`)
        .limit(25);

      if (error) {
        console.error('[searchMedicines] ilike fallback failed:', error.message);
        throw new AppError('Failed to search medicines', 500);
      }
      sendSuccess(res, { medicines: data ?? [] }, 'Medicines retrieved');
      return;
    }

    sendSuccess(res, { medicines: ftsData ?? [] }, 'Medicines retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/doctors/me/appointments/:appointmentId/prescriptions
 * Creates a prescription with multiple medicine items for an appointment.
 */
export async function createPrescription(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Authenticated user not found', 401);

    const doctor = await requireDoctor(userId);
    const { appointmentId } = req.params as { appointmentId: string };
    const { illness_description, items } = req.body as CreatePrescriptionBody;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestError('At least one medicine item is required');
    }

    // Verify the appointment belongs to this doctor
    const { data: appointment, error: apptError } = await supabaseAdmin
      .from('appointments')
      .select('id, doctor_id, patient_id, status')
      .eq('id', appointmentId)
      .eq('doctor_id', doctor.id)
      .single();

    if (apptError || !appointment) {
      throw new NotFoundError('Appointment not found');
    }

    // Check if prescription already exists for this appointment
    const { data: existingRx } = await supabaseAdmin
      .from('prescriptions')
      .select('id')
      .eq('appointment_id', appointmentId)
      .maybeSingle();

    if (existingRx) {
      throw new BadRequestError('A prescription already exists for this appointment');
    }

    // Create the prescription header
    const { data: prescription, error: rxError } = await supabaseAdmin
      .from('prescriptions')
      .insert({
        appointment_id: appointmentId,
        doctor_id: doctor.id,
        patient_id: appointment.patient_id,
        illness_description: illness_description ?? null,
        issued_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (rxError || !prescription) {
      console.error('[createPrescription] prescription insert failed:', rxError?.message);
      throw new AppError('Failed to create prescription', 500);
    }

    // Insert all medicine items
    const prescriptionItems = items.map((item) => ({
      prescription_id: prescription.id,
      medicine_id: item.medicine_id,
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
      doctor_comment: item.doctor_comment ?? null,
    }));

    const { data: insertedItems, error: itemsError } = await supabaseAdmin
      .from('prescription_items')
      .insert(prescriptionItems)
      .select();

    if (itemsError) {
      console.error('[createPrescription] items insert failed:', itemsError.message);
      // Roll back prescription header
      await supabaseAdmin.from('prescriptions').delete().eq('id', prescription.id);
      throw new AppError('Failed to create prescription items', 500);
    }

    // Auto-complete the appointment now that a prescription has been issued
    const { error: completeError } = await supabaseAdmin
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', appointmentId);

    if (completeError) {
      // Non-fatal: log but don't fail — prescription was created successfully
      console.error('[createPrescription] auto-complete appointment failed:', completeError.message);
    } else {
      // Write status log entry
      const { error: logError } = await supabaseAdmin.from('appointment_status_log').insert({
        appointment_id: appointmentId,
        old_status: appointment.status,
        new_status: 'completed',
        changed_by: userId,
        changed_at: new Date().toISOString(),
      });
      if (logError) {
        console.error('[createPrescription] status log insert failed:', logError.message);
      }
    }

    sendSuccess(
      res,
      { prescription: { ...prescription, prescription_items: insertedItems } },
      'Prescription created',
      201
    );
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/doctors/me/prescriptions
 * Returns all prescriptions issued by the doctor.
 */
export async function listDoctorPrescriptions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Authenticated user not found', 401);

    const doctor = await requireDoctor(userId);

    const { data, error } = await supabaseAdmin
      .from('prescriptions')
      .select(
        `id, appointment_id, doctor_id, patient_id, illness_description, issued_at, pdf_url,
         patients ( full_name, dob ),
         prescription_items (
           id, prescription_id, medicine_id,
           dosage, frequency, duration, doctor_comment,
           medicines ( medicine_name, therapeutic_class )
         )`
      )
      .eq('doctor_id', doctor.id)
      .order('issued_at', { ascending: false });

    if (error) {
      console.error('[listDoctorPrescriptions] query failed:', error.message);
      throw new AppError('Failed to fetch prescriptions', 500);
    }

    sendSuccess(res, { prescriptions: data ?? [] }, 'Prescriptions retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/doctors/me/prescriptions/:id
 * Returns a single prescription with its items and medicines.
 */
export async function getDoctorPrescription(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Authenticated user not found', 401);

    const doctor = await requireDoctor(userId);
    const { id } = req.params as { id: string };

    const { data, error } = await supabaseAdmin
      .from('prescriptions')
      .select(
        `id, appointment_id, doctor_id, patient_id, illness_description, issued_at, pdf_url,
         patients ( full_name, dob, blood_group, known_allergies ),
         doctors ( full_name, specialisation, qualifications, registration_number, department ),
         appointments (
           hospital_id,
           appointment_slots ( slot_start ),
           hospitals ( name, city )
         ),
         prescription_items (
           id, prescription_id, medicine_id,
           dosage, frequency, duration, doctor_comment,
           medicines ( medicine_name, composition, therapeutic_class )
         )`
      )
      .eq('id', id)
      .eq('doctor_id', doctor.id)
      .single();

    if (error || !data) {
      throw new NotFoundError('Prescription not found');
    }

    sendSuccess(res, { prescription: data }, 'Prescription retrieved');
  } catch (err) {
    next(err);
  }
}
