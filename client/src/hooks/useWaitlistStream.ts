import { useEffect, useRef } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WaitlistUpdatePayload {
  event: 'UPDATE' | 'INSERT' | 'DELETE';
  entry: {
    id: string;
    slot_id: string;
    patient_id: string;
    status: string;
    queued_at: string;
    notified_at: string | null;
    offer_expires_at: string | null;
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Opens a persistent SSE connection to
 *   GET /api/patients/me/waitlist/stream
 *
 * The server pushes a `waitlist-update` event instantly whenever one of the
 * patient's `slot_waitlist` rows changes in the database (INSERT, UPDATE,
 * DELETE).  There is no polling — the browser is notified in real time.
 *
 * Calls `onUpdate` for every incoming event.  The connection is automatically
 * closed when the component unmounts.
 *
 * @param enabled     - Pass false to pause (e.g. not on the Waitlist tab).
 * @param onUpdate    - Callback invoked for each incoming waitlist change.
 */
export function useWaitlistStream(
  enabled: boolean,
  onUpdate: (payload: WaitlistUpdatePayload) => void
): void {
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  useEffect(() => {
    if (!enabled) return;

    const url = `${BASE_URL}/api/patients/me/waitlist/stream`;

    // withCredentials: true ensures the browser sends the httpOnly auth cookie
    const es = new EventSource(url, { withCredentials: true });

    es.addEventListener('waitlist-update', (e: MessageEvent) => {
      try {
        const payload: WaitlistUpdatePayload = JSON.parse(e.data);
        callbackRef.current(payload);
      } catch {
        console.warn('[useWaitlistStream] Failed to parse waitlist-update payload:', e.data);
      }
    });

    es.addEventListener('connected', (e: MessageEvent) => {
      try {
        const info = JSON.parse(e.data);
        console.log('[useWaitlistStream] Connected:', info);
      } catch { /* ignore */ }
    });

    es.onerror = () => {
      // EventSource auto-reconnects — just log
      console.warn('[useWaitlistStream] SSE error — browser will retry automatically');
    };

    return () => {
      es.close();
    };
  }, [enabled]);
}
