import type { Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Payload pushed to the patient's browser whenever one of their waitlist rows
 * changes in the database.
 *
 * The client uses this to update the WaitlistPanel without any polling:
 *  - status → 'notified'  : show "Accept / Decline" offer UI immediately
 *  - status → 'expired'   : remove the card or show expired state
 *  - status → 'cancelled' : remove the card
 * A full row is sent so the client can rebuild its local state without a
 * round-trip fetch.
 */
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

// ─── Internal state ───────────────────────────────────────────────────────────

interface PatientEntry {
  channel: RealtimeChannel;
  /** All currently open SSE Response objects for this patient */
  clients: Set<Response>;
}

/**
 * Map of patientId → { channel, clients }
 *
 * One Supabase Realtime channel per patient watches every row in
 * slot_waitlist WHERE patient_id = <id>.  The channel is opened when the
 * first browser tab connects and torn down when the last tab disconnects.
 */
const patientChannels = new Map<string, PatientEntry>();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sendEvent(res: Response, eventName: string, data: unknown): void {
  try {
    res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
  } catch {
    // Swallow — client already disconnected
  }
}

function broadcast(patientId: string, payload: WaitlistUpdatePayload): void {
  const entry = patientChannels.get(patientId);
  if (!entry) return;
  for (const client of entry.clients) {
    sendEvent(client, 'waitlist-update', payload);
  }
}

/**
 * Open a Supabase Realtime channel that watches INSERT/UPDATE/DELETE on
 * `slot_waitlist` rows belonging to this patient.
 */
function openChannel(patientId: string): RealtimeChannel {
  const channel = supabaseAdmin
    .channel(`waitlist:${patientId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'slot_waitlist',
        filter: `patient_id=eq.${patientId}`,
      },
      (payload) => {
        const record: any =
          payload.eventType === 'DELETE' ? payload.old : payload.new;

        if (!record?.id) return;

        const update: WaitlistUpdatePayload = {
          event: payload.eventType as 'UPDATE' | 'INSERT' | 'DELETE',
          entry: {
            id: record.id,
            slot_id: record.slot_id,
            patient_id: record.patient_id,
            status: record.status,
            queued_at: record.queued_at,
            notified_at: record.notified_at ?? null,
            offer_expires_at: record.offer_expires_at ?? null,
          },
        };

        broadcast(patientId, update);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[waitlistChannelManager] Realtime channel open for patient: ${patientId}`);
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error(`[waitlistChannelManager] Channel error for patient ${patientId}: ${status}`);
      }
    });

  return channel;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Register an SSE client for a given patient.
 * Opens a Realtime channel if one doesn't exist for this patient yet.
 */
export function subscribeWaitlistClient(res: Response, patientId: string): void {
  if (!patientChannels.has(patientId)) {
    const channel = openChannel(patientId);
    patientChannels.set(patientId, { channel, clients: new Set() });
  }

  patientChannels.get(patientId)!.clients.add(res);
  console.log(
    `[waitlistChannelManager] Client added for patient ${patientId} — total: ${patientChannels.get(patientId)!.clients.size}`
  );
}

/**
 * Remove a client.  If it was the last one for this patient, tear down the
 * Realtime channel to avoid leaking WebSocket connections.
 */
export function unsubscribeWaitlistClient(res: Response, patientId: string): void {
  const entry = patientChannels.get(patientId);
  if (!entry) return;

  entry.clients.delete(res);
  console.log(
    `[waitlistChannelManager] Client removed for patient ${patientId} — remaining: ${entry.clients.size}`
  );

  if (entry.clients.size === 0) {
    supabaseAdmin.removeChannel(entry.channel);
    patientChannels.delete(patientId);
    console.log(`[waitlistChannelManager] Realtime channel closed for patient: ${patientId}`);
  }
}
