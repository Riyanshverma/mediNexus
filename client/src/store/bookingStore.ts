import { create } from 'zustand';
import type { Slot } from '../types/slot';

interface BookingState {
  lockedSlot: Slot | null;
  lockedUntil: number | null; // timestamp
  setLockedSlot: (slot: Slot, expiresAt: number) => void;
  clearBooking: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  lockedSlot: null,
  lockedUntil: null,
  setLockedSlot: (slot, expiresAt) => set({ lockedSlot: slot, lockedUntil: expiresAt }),
  clearBooking: () => set({ lockedSlot: null, lockedUntil: null }),
}));
