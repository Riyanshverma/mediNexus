import cron from 'node-cron';
import { supabaseAdmin } from '../config/supabase.js';
import { notifyAllWaiting } from './waitlistQueue.js';

/**
 * Releases expired slot locks every 10 seconds.
 *
 * Slots with status='locked' and locked_until < NOW() are reset to 'available'.
 * After freeing each slot, the waitlist queue is immediately notified so waiting
 * patients receive their offer without waiting for the next waitlist cron tick.
 */
export function startSlotLockCleanupJob(): void {
  cron.schedule('*/10 * * * * *', async () => {
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('appointment_slots')
      .update({ status: 'available', locked_by: null, locked_until: null })
      .eq('status', 'locked')
      .lt('locked_until', now)
      .select('id');

    if (error) {
      console.error('[slotLockCleanup] Failed to release expired locks:', error.message);
      return;
    }

    if (!data || data.length === 0) return;

    console.log(`[slotLockCleanup] Released ${data.length} expired slot lock(s)`);

    // Immediately notify any waiting patients — don't wait for the waitlist cron.
    for (const { id: slotId } of data) {
      await notifyAllWaiting(slotId);
    }
  });

  console.log('[slotLockCleanup] Slot lock cleanup job scheduled (every 10s)');
}
