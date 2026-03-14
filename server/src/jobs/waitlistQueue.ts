import cron from 'node-cron';
import { supabaseAdmin } from '../config/supabase.js';

/**
 * Notify ALL 'waiting' patients in the queue for a given slot.
 * Every waiting patient gets status → 'notified' with the same offer window.
 * The slot is a single resource — the first patient to call acceptOffer wins
 * the atomic slot-lock. All other accept attempts will find the slot no longer
 * 'available' and be rejected gracefully.
 *
 * Called:
 *  - from cancelPatientAppointment (slot just freed)
 *  - from the cron job when all 'notified' entries expire (re-broadcast remaining 'waiting')
 */
export async function notifyAllWaiting(slotId: string): Promise<number> {
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
 * Runs every 60 seconds.
 *
 * For each slot where ALL 'notified' entries have expired (offer window closed
 * and nobody accepted), expire those entries and re-broadcast to the remaining
 * 'waiting' patients.
 *
 * Concurrency guarantee:
 *  - acceptOffer atomically updates slot status 'available' → 'locked' in a
 *    single UPDATE guarded by .eq('status', 'available').
 *  - Only the first concurrent accept succeeds; all others get 0 rows back
 *    and receive a 409 ConflictError.
 *  - The cron fires at most every 60s, so the race window is small.
 */
export function startWaitlistQueueJob(): void {
  cron.schedule('* * * * *', async () => {
    const now = new Date().toISOString();

    // Step 1: expire all stale 'notified' offers
    const { data: expired, error } = await supabaseAdmin
      .from('slot_waitlist')
      .update({ status: 'expired' })
      .eq('status', 'notified')
      .lt('offer_expires_at', now)
      .select('id, slot_id');

    if (error) {
      console.error('[waitlistQueue] Failed to expire stale offers:', error.message);
      return;
    }

    if (!expired || expired.length === 0) return;

    console.log(`[waitlistQueue] Expired ${expired.length} stale offer(s)`);

    // Step 2: for each affected slot, check if it is still available and
    // if there are still 'waiting' patients — if so, re-broadcast
    const affectedSlots = [...new Set(expired.map((e) => e.slot_id as string))];

    for (const slotId of affectedSlots) {
      const { data: slot } = await supabaseAdmin
        .from('appointment_slots')
        .select('status')
        .eq('id', slotId)
        .single();

      if (slot?.status !== 'available') continue;

      // Check there are no currently 'notified' entries (another broadcast in flight)
      const { data: stillNotified } = await supabaseAdmin
        .from('slot_waitlist')
        .select('id')
        .eq('slot_id', slotId)
        .eq('status', 'notified')
        .limit(1)
        .maybeSingle();

      if (stillNotified) continue; // someone still has an active offer

      await notifyAllWaiting(slotId);
    }
  });

  console.log('[waitlistQueue] Waitlist queue job scheduled (every 60s)');
}

