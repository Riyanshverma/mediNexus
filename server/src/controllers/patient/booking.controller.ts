import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { sendSuccess } from '../../utils/response.js';
import { AppError, NotFoundError, BadRequestError, ConflictError } from '../../utils/errors.js';
import { requirePatient } from '../../utils/lookup.js';

// ─── Types ───────────────────────────────────────────────────────────

interface LockSlotBody {
  slot_id: string;
}

interface ConfirmBookingBody {
  slot_id: string;
  doctor_id: string;
  hospital_id: string;
  service_id?: string;
  booking_type?: 'online' | 'walk_in' | 'referral';
}

interface JoinWaitlistBody {
  slot_id: string;
}

/**
 * POST /api/patients/me/slots/lock
 * Step 1 of booking: atomically soft-locks a slot for 3 minutes.
 * Returns 409 if the slot is already taken.
 */
export async function lockSlot(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Authenticated user not found', 401);

    const patient = await requirePatient(userId);
    const { slot_id } = req.body as LockSlotBody;

    if (!slot_id) throw new BadRequestError('slot_id is required');

    // Atomic UPDATE – only succeeds if status is still 'available'
    const lockedUntil = new Date(Date.now() + 3 * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin
      .from('appointment_slots')
      .update({
        status: 'locked' as any,
        locked_by: patient.id,
        locked_until: lockedUntil,
      })
      .eq('id', slot_id)
      .eq('status', 'available')
      .select('id, slot_start, slot_end, doctor_id, status, locked_until')
      .maybeSingle();

    if (error) {
      console.error('[lockSlot] update failed:', error.message);
      throw new AppError('Failed to acquire slot lock', 500);
    }

    if (!data) {
      // 0 rows updated — slot is taken or doesn't exist
      const { data: existing } = await supabaseAdmin
        .from('appointment_slots')
        .select('status')
        .eq('id', slot_id)
        .maybeSingle();

      if (!existing) throw new NotFoundError('Slot not found');
      throw new ConflictError(
        `Slot is no longer available (current status: ${existing.status})`
      );
    }

    sendSuccess(
      res,
      { slot: data, locked_until: lockedUntil },
      'Slot locked. You have 3 minutes to confirm your booking.'
    );
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/patients/me/appointments
 * Step 2 of booking: verifies the soft-lock is still valid, creates the appointment.
 */
export async function bookAppointment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Authenticated user not found', 401);

    const patient = await requirePatient(userId);
    const {
      slot_id,
      doctor_id,
      hospital_id,
      service_id,
      booking_type = 'online',
    } = req.body as ConfirmBookingBody;

    if (!slot_id || !doctor_id || !hospital_id) {
      throw new BadRequestError('slot_id, doctor_id, and hospital_id are required');
    }

    // Re-verify lock is still held by this patient
    const { data: slot, error: slotError } = await supabaseAdmin
      .from('appointment_slots')
      .select('id, status, locked_by, locked_until, doctor_id')
      .eq('id', slot_id)
      .single();

    if (slotError || !slot) {
      throw new NotFoundError('Slot not found');
    }

    if (slot.status !== 'locked' || slot.locked_by !== patient.id) {
      throw new ConflictError(
        'Slot lock not held by you. Please re-select and lock the slot first.'
      );
    }

    if (slot.locked_until && new Date(slot.locked_until) < new Date()) {
      throw new AppError('Slot lock has expired. Please select the slot again.', 410);
    }

    // Create the appointment record
    const { data: appointment, error: apptError } = await supabaseAdmin
      .from('appointments')
      .insert({
        slot_id,
        patient_id: patient.id,
        doctor_id,
        hospital_id,
        service_id: service_id ?? null as any,
        booking_type,
        status: 'booked',
      })
      .select()
      .single();

    if (apptError || !appointment) {
      console.error('[bookAppointment] appointment insert failed:', apptError?.message);
      throw new AppError('Failed to create appointment', 500);
    }

    // Mark slot as booked
    const { error: updateError } = await supabaseAdmin
      .from('appointment_slots')
      .update({
        status: 'booked',
        locked_by: null,
        locked_until: null,
      })
      .eq('id', slot_id);

    if (updateError) {
      console.error('[bookAppointment] slot update failed:', updateError.message);
      // Non-fatal for the patient — appointment is created
    }

    sendSuccess(res, { appointment }, 'Appointment booked successfully', 201);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/patients/me/slots/:slotId/release
 * Releases a soft-lock early (if the patient changes their mind).
 */
export async function releaseSlotLock(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Authenticated user not found', 401);

    const patient = await requirePatient(userId);
    const { slotId } = req.params as { slotId: string };

    const { data, error } = await supabaseAdmin
      .from('appointment_slots')
      .update({ status: 'available', locked_by: null, locked_until: null })
      .eq('id', slotId)
      .eq('status', 'locked')
      .eq('locked_by', patient.id)
      .select()
      .maybeSingle();

    if (error) {
      throw new AppError('Failed to release lock', 500);
    }

    if (!data) {
      throw new BadRequestError('No active lock found for this slot');
    }

    sendSuccess(res, null, 'Slot lock released');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/patients/me/waitlist
 * Adds the patient to the waitlist for a fully booked slot.
 */
export async function joinWaitlist(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Authenticated user not found', 401);

    const patient = await requirePatient(userId);
    const { slot_id } = req.body as JoinWaitlistBody;

    if (!slot_id) throw new BadRequestError('slot_id is required');

    // Check slot is actually booked/locked
    const { data: slot } = await supabaseAdmin
      .from('appointment_slots')
      .select('id, status')
      .eq('id', slot_id)
      .single();

    if (!slot) throw new NotFoundError('Slot not found');

    // Check not already on waitlist
    const { data: existing } = await supabaseAdmin
      .from('slot_waitlist')
      .select('id, status')
      .eq('slot_id', slot_id)
      .eq('patient_id', patient.id)
      .in('status', ['waiting', 'offered'])
      .maybeSingle();

    if (existing) {
      throw new ConflictError('You are already on the waitlist for this slot');
    }

    const { data, error } = await supabaseAdmin
      .from('slot_waitlist')
      .insert({
        slot_id,
        patient_id: patient.id,
        queued_at: new Date().toISOString(),
        status: 'waiting',
      })
      .select()
      .single();

    if (error || !data) {
      console.error('[joinWaitlist] insert failed:', error?.message);
      throw new AppError('Failed to join waitlist', 500);
    }

    sendSuccess(res, { waitlist_entry: data }, "You've been added to the waitlist", 201);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/patients/me/waitlist
 * Lists the patient's active waitlist entries.
 */
export async function listPatientWaitlist(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Authenticated user not found', 401);

    const patient = await requirePatient(userId);

    const { data, error } = await supabaseAdmin
      .from('slot_waitlist')
      .select(
        `id, slot_id, patient_id, queued_at, notified_at, offer_expires_at, status,
         appointment_slots ( slot_start, slot_end,
           doctors ( full_name, specialisation,
             hospitals ( name, city )
           )
         )`
      )
      .eq('patient_id', patient.id)
      .in('status', ['waiting', 'offered'])
      .order('queued_at', { ascending: true });

    if (error) {
      console.error('[listPatientWaitlist] query failed:', error.message);
      throw new AppError('Failed to fetch waitlist', 500);
    }

    sendSuccess(res, { waitlist: data ?? [] }, 'Waitlist retrieved');
  } catch (err) {
    next(err);
  }
}
