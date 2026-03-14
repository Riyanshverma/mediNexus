import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { sendSuccess } from '../../utils/response.js';
import { AppError, NotFoundError, BadRequestError } from '../../utils/errors.js';
import { requireDoctor } from '../../utils/lookup.js';
import type { CreateSlotsBody } from '../../validators/doctor/slot.validator.js';

/**
 * GET /api/doctors/me/slots?upcoming=true
 * Default: upcoming=true (only future available slots).
 * Pass upcoming=false to get all slots.
 */
export async function listDoctorSlots(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Authenticated user not found', 401);

    const doctor = await requireDoctor(userId);
    const upcoming = (req.query['upcoming'] as string) !== 'false';

    let query = supabaseAdmin
      .from('appointment_slots')
      .select('*')
      .eq('doctor_id', doctor.id)
      .order('slot_start');

    if (upcoming) {
      query = query.gt('slot_start', new Date().toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('[listDoctorSlots] query failed:', error.message);
      throw new AppError('Failed to fetch slots', 500);
    }

    sendSuccess(res, { slots: data ?? [] }, 'Slots retrieved');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/doctors/me/slots
 * Bulk-creates appointment slots for the authenticated doctor.
 */
export async function createDoctorSlots(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Authenticated user not found', 401);

    const doctor = await requireDoctor(userId);
    const { slots } = req.body as CreateSlotsBody;

    // Validate slot_start < slot_end for each slot
    for (const slot of slots) {
      if (new Date(slot.slot_start) >= new Date(slot.slot_end)) {
        throw new BadRequestError(
          `slot_start must be before slot_end (got start=${slot.slot_start}, end=${slot.slot_end})`
        );
      }
    }

    const rows = slots.map((s) => ({
      doctor_id: doctor.id,
      slot_start: s.slot_start,
      slot_end: s.slot_end,
      status: 'available' as const,
    }));

    const { data, error } = await supabaseAdmin
      .from('appointment_slots')
      .insert(rows)
      .select();

    if (error || !data) {
      console.error('[createDoctorSlots] insert failed:', error?.message);
      throw new AppError('Failed to create slots', 500);
    }

    sendSuccess(res, { slots: data }, `${data.length} slot(s) created`, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/doctors/me/slots/:slotId
 * Only allowed if the slot is still 'available' (not booked/locked).
 */
export async function deleteDoctorSlot(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Authenticated user not found', 401);

    const doctor = await requireDoctor(userId);
    const { slotId } = req.params as { slotId: string };

    // Verify ownership + current status
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('appointment_slots')
      .select('id, doctor_id, status')
      .eq('id', slotId)
      .eq('doctor_id', doctor.id)
      .single();

    if (fetchError || !existing) {
      throw new NotFoundError('Slot not found');
    }

    if (existing.status !== 'available') {
      throw new BadRequestError(
        `Cannot delete a slot with status: ${existing.status}. Only 'available' slots can be deleted.`
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from('appointment_slots')
      .delete()
      .eq('id', slotId);

    if (deleteError) {
      console.error('[deleteDoctorSlot] delete failed:', deleteError.message);
      throw new AppError('Failed to delete slot', 500);
    }

    sendSuccess(res, null, 'Slot deleted');
  } catch (err) {
    next(err);
  }
}
