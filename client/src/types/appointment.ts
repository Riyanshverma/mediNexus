export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'in_progress';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  hospitalId: string;
  slotId: string;
  date: string; // ISO string
  status: AppointmentStatus;
  symptoms?: string;
  amount: number;
  paymentStatus: 'pending' | 'completed' | 'refunded';
}
