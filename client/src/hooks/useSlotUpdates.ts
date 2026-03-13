import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { API_BASE } from '../lib/api';
import type { Slot } from '../types/slot';

export const useSlotUpdates = (doctorId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!doctorId) return;

    const es = new EventSource(`${API_BASE}/slots/live/${doctorId}`);
    
    es.onmessage = (e) => {
      try {
        const update = JSON.parse(e.data);
        queryClient.setQueryData(
          ['slots', doctorId],
          (old: Slot[] | undefined) => {
            if (!old) return old;
            return old.map(slot =>
              slot.id === update.slot_id
                ? { ...slot, status: update.status }
                : slot
            );
          }
        );
      } catch (err) {
        console.error('Error parsing SSE slot update', err);
      }
    };

    return () => es.close();
  }, [doctorId, queryClient]);
};
