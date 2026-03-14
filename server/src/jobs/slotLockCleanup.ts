import cron from 'node-cron';
import { supabaseAdmin } from '../config/supabase.js';

/**
 * Releases expired slot locks every 60 seconds.
 * Slots with status='locked' and locked_until < NOW() are reset to 'available'.
 */
export function startSlotLockCleanupJob(): void {
  cron.schedule('* * * * *', async () => {
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

    if (data && data.length > 0) {
      console.log(`[slotLockCleanup] Released ${data.length} expired slot lock(s)`);
    }
  });

  console.log('[slotLockCleanup] Slot lock cleanup job scheduled (every 60s)');
}
