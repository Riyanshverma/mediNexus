export type SlotStatus = 'available' | 'selected' | 'soft_locked' | 'booked';

export interface Slot {
  id: string;
  doctorId: string;
  hospitalId: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: SlotStatus;
}
