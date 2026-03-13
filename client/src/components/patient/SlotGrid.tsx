import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { LuLock } from 'react-icons/lu';
import { useSlotUpdates } from '../../hooks/useSlotUpdates';
import { useBookingStore } from '../../store/bookingStore';
import type { Slot } from '../../types/slot';
import { formatTime } from '../../lib/date';
import toast from 'react-hot-toast';

interface SlotGridProps {
  doctorId: string;
}

export const SlotGrid: React.FC<SlotGridProps> = ({ doctorId }) => {
  // Subscribe to live SSE updates
  useSlotUpdates(doctorId);
  const { lockedSlot, setLockedSlot } = useBookingStore();

  const { data: slots, isLoading, error } = useQuery<Slot[]>({
    queryKey: ['slots', doctorId],
    queryFn: async () => {
      // Mocking fetch since we don't have the backend running yet, 
      // replace with actual implementation when backend is ready:
      // return fetchWithAuth(`/slots?doctorId=${doctorId}`);
      return [
        { id: '1', doctorId, hospitalId: 'h1', startTime: new Date(new Date().setHours(9, 0)).toISOString(), endTime: new Date(new Date().setHours(9, 30)).toISOString(), status: 'available' },
        { id: '2', doctorId, hospitalId: 'h1', startTime: new Date(new Date().setHours(9, 30)).toISOString(), endTime: new Date(new Date().setHours(10, 0)).toISOString(), status: 'booked' },
        { id: '3', doctorId, hospitalId: 'h1', startTime: new Date(new Date().setHours(10, 0)).toISOString(), endTime: new Date(new Date().setHours(10, 30)).toISOString(), status: 'soft_locked' },
        { id: '4', doctorId, hospitalId: 'h1', startTime: new Date(new Date().setHours(10, 30)).toISOString(), endTime: new Date(new Date().setHours(11, 0)).toISOString(), status: 'available' },
        { id: '5', doctorId, hospitalId: 'h1', startTime: new Date(new Date().setHours(11, 0)).toISOString(), endTime: new Date(new Date().setHours(11, 30)).toISOString(), status: 'available' },
        { id: '6', doctorId, hospitalId: 'h1', startTime: new Date(new Date().setHours(11, 30)).toISOString(), endTime: new Date(new Date().setHours(12, 0)).toISOString(), status: 'available' },
      ];
    }
  });

  const handleSlotClick = async (slot: Slot) => {
    if (slot.status !== 'available') return;
    
    if (lockedSlot && lockedSlot.id !== slot.id) {
      toast.error('You already have a locked slot. Please clear it first.');
      return;
    }

    try {
      // Mocking the lock request
      // const res = await fetchWithAuth(`/slots/lock`, {
      //   method: 'POST',
      //   body: JSON.stringify({ slotId: slot.id }),
      // });
      
      const success = true; 
      
      if (success) {
        // Lock for 3 minutes (180 seconds)
        setLockedSlot(slot, Date.now() + 180 * 1000);
        toast.success(`Slot locked for 3 minutes.`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to lock slot');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 rounded-md bg-muted animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error || !slots) {
    return <div className="text-center text-destructive p-4">Failed to load slots</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {slots.map((slot) => {
        const isSelected = lockedSlot?.id === slot.id;
        
        let variant: 'default' | 'outline' | 'ghost' | 'secondary' = 'outline';
        let className = 'text-primary border-primary/30 w-full';
        let content = <>{formatTime(slot.startTime)}</>;
        let disabled = false;

        if (isSelected) {
          variant = 'default';
          className = 'w-full';
        } else if (slot.status === 'booked') {
          variant = 'ghost';
          disabled = true;
          className = 'w-full line-through text-muted-foreground opacity-50';
        } else if (slot.status === 'soft_locked') {
          variant = 'ghost';
          disabled = true;
          className = 'w-full text-muted-foreground opacity-50';
          content = (
            <div className="flex items-center justify-center gap-1.5">
              <LuLock size={14} />
              <span>{formatTime(slot.startTime)}</span>
            </div>
          );
        }

        return (
          <Button
            key={slot.id}
            variant={variant}
            className={className}
            disabled={disabled}
            onClick={() => handleSlotClick(slot)}
          >
            {content}
          </Button>
        );
      })}
    </div>
  );
};
