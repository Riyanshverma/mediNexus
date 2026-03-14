import cron from 'node-cron';
import { supabaseAdmin } from '../config/supabase.js';

/**
 * Notify ALL 'waiting' patients in the queue for a given slot.
 * Every waiting patient gets status → 'notified' with the same offer window.
 *
 * The slot is a single resource — the first patient to call acceptOffer wins
 * the atomic slot-lock.  All other accept attempts find the slot no longer
 * 'available' and are rejected gracefully with a 409.
 *
 * Called from:
 *  - cancelPatientAppointment   (slot just freed by cancellation)
 *  - slotLockCleanup job        (slot freed because patient abandoned checkout)
 *  - waitlistQueue cron         (re-broadcast after all notified offers expired)
 */
export async function notifyAllWaiting(slotId: string): Promise<number> {
  // Guard: only notify if the slot is actually available right now.
  // This prevents spurious notifications if two code paths race.
  const { data: slot } = await supabaseAdmin
    .from('appointment_slots')
    .select('status')
    .eq('id', slotId)
    .single();

  if (slot?.status !== 'available') return 0;

  // Guard: don't double-notify if there are already active 'notified' offers.
  const { data: existing } = await supabaseAdmin
    .from('slot_waitlist')
    .select('id')
    .eq('slot_id', slotId)
    .eq('status', 'notified')
    .limit(1)
    .maybeSingle();

  if (existing) return 0; // offer already live — skip

  const offerExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min
  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('slot_waitlist')
    .update({
      status: 'notified',
      notified_at: now,
      offer_expires_at: offerExpiresAt,
    })
    .eq('slot_id', slotId)
    .eq('status', 'waiting')
    .select('id');

  if (error) {
    console.error(`[waitlistQueue] Failed to notify waiting patients for slot ${slotId}:`, error.message);
    return 0;
  }

  const count = data?.length ?? 0;
  if (count > 0) {
    console.log(`[waitlistQueue] Notified ${count} waiting patient(s) for slot ${slotId}`);
  }
  return count;
}

/**
 * Runs every 10 seconds.
 *
 * Two jobs in one pass:
 *
 * 1. Expire stale 'notified' offers whose offer window closed without anyone
 *    accepting.  Then re-broadcast to the remaining 'waiting' patients.
 *
 * 2. Catch 'orphaned waiting' entries — slots that are available but whose
 *    waiting patients were never notified (e.g. the server restarted between
 *    a slot being freed and notifyAllWaiting being called).
 */
export function startWaitlistQueueJob(): void {
  cron.schedule('*/10 * * * * *', async () => {
    const now = new Date().toISOString();

    // ── Step 1: expire stale notified offers ─────────────────────────────────
    const { data: expired, error } = await supabaseAdmin
      .from('slot_waitlist')
      .update({ status: 'expired' })
      .eq('status', 'notified')
      .lt('offer_expires_at', now)
      .select('id, slot_id');

    if (error) {
      console.error('[waitlistQueue] Failed to expire stale offers:', error.message);
    }

    if (expired && expired.length > 0) {
      console.log(`[waitlistQueue] Expired ${expired.length} stale offer(s)`);

      // Re-broadcast for each affected slot (notifyAllWaiting guards internally)
      const affectedSlots = [...new Set(expired.map((e) => e.slot_id as string))];
      for (const slotId of affectedSlots) {
        await notifyAllWaiting(slotId);
      }
    }

    // ── Step 2: catch orphaned waiting entries ────────────────────────────────
    // Find slots that are 'available' AND have at least one 'waiting' entry
    // but NO 'notified' entry.  These got stuck — notify them now.
    const { data: orphaned } = await supabaseAdmin
      .from('slot_waitlist')
      .select('slot_id')
      .eq('status', 'waiting');

    if (!orphaned || orphaned.length === 0) return;

    const candidateSlotIds = [...new Set(orphaned.map((e) => e.slot_id as string))];

    // Filter to only available slots
    const { data: availableSlots } = await supabaseAdmin
      .from('appointment_slots')
      .select('id')
      .in('id', candidateSlotIds)
      .eq('status', 'available');

    if (!availableSlots || availableSlots.length === 0) return;

    for (const { id: slotId } of availableSlots) {
      // notifyAllWaiting already guards against double-notifying
      await notifyAllWaiting(slotId);
    }
  });

  console.log('[waitlistQueue] Waitlist queue job scheduled (every 10s)');
}
