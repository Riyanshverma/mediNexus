import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DoctorProfile {
  id: string;
  user_id: string;
  hospital_id: string;
  full_name: string;
  specialisation: string;
  prescription_template: string | null;
  verified: boolean;
  created_at: string;
}

export interface DoctorAppointment {
  id: string;
  slot_id: string;
  patient_id: string;
  doctor_id: string;
  hospital_id: string;
  service_id: string;
  booking_type: string;
  status: string;
  notes: string | null;
  created_at: string;
  appointment_slots: { slot_start: string; slot_end: string } | null;
  patients: {
    full_name: string;
    phone_number: string | null;
    email: string | null;
    dob: string | null;
    blood_group: string | null;
    known_allergies: string | null;
  } | null;
  hospitals: { name: string; city: string } | null;
}

export interface DoctorSlot {
  id: string;
  doctor_id: string;
  slot_start: string;
  slot_end: string;
  status: string;
  locked_by: string | null;
  locked_until: string | null;
}

export interface Prescription {
  id: string;
  appointment_id: string;
  doctor_id: string;
  patient_id: string;
  illness_description: string | null;
  issued_at: string;
  pdf_url: string | null;
  prescription_items?: PrescriptionItem[];
  patients?: { full_name: string } | null;
  appointments?: { appointment_slots: { slot_start: string; slot_end: string } | null } | null;
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  medicine_id: string;
  dosage: string;
  frequency: string;
  duration: string;
  doctor_comment: string | null;
  medicines?: { medicine_name: string; composition: string | null } | null;
}

export interface MedicineResult {
  id: string;
  medicine_name: string;
  composition: string | null;
  therapeutic_class: string | null;
  uses: string | null;
  side_effects: string | null;
}

export interface CreatePrescriptionPayload {
  illness_description?: string;
  items: {
    medicine_id: string;
    dosage: string;
    frequency: string;
    duration: string;
    doctor_comment?: string;
  }[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const doctorService = {
  // Profile
  getProfile: () =>
    api.get<{ data: { doctor: DoctorProfile } }>('/api/doctors/me'),

  updateProfile: (payload: {
    full_name?: string;
    specialisation?: string;
    prescription_template?: string;
  }) =>
    api.patch<{ data: { doctor: DoctorProfile } }>('/api/doctors/me', payload),

  // Appointments
  listAppointments: (filter: 'upcoming' | 'past' | 'all' = 'all') =>
    api.get<{ data: { appointments: DoctorAppointment[] } }>(
      `/api/doctors/me/appointments?filter=${filter}`
    ),

  updateAppointmentStatus: (
    id: string,
    status: string,
    notes?: string
  ) =>
    api.patch<{ data: { appointment: DoctorAppointment } }>(
      `/api/doctors/me/appointments/${id}/status`,
      { status, notes }
    ),

  // Slots
  listSlots: (upcoming = true) =>
    api.get<{ data: { slots: DoctorSlot[] } }>(
      `/api/doctors/me/slots?upcoming=${upcoming}`
    ),

  generateSlots: (payload: {
    working_days: number[];
    start_time: string;
    end_time: string;
    slot_duration_mins: number;
    days_ahead?: number;
  }) =>
    api.post<{ data: { generated: number; attempted: number } }>(
      '/api/doctors/me/slots/generate',
      payload
    ),

  blockSlot: (slotId: string) =>
    api.patch<{ data: { slot: DoctorSlot } }>(
      `/api/doctors/me/slots/${slotId}/block`
    ),

  unblockSlot: (slotId: string) =>
    api.patch<{ data: { slot: DoctorSlot } }>(
      `/api/doctors/me/slots/${slotId}/unblock`
    ),

  deleteSlot: (slotId: string) =>
    api.delete<{ data: null }>(`/api/doctors/me/slots/${slotId}`),

  markLeave: (leave_date: string) =>
    api.post<{ data: { blocked: number } }>('/api/doctors/me/leave', { leave_date }),

  // Medicines
  searchMedicines: (q: string) =>
    api.get<{ data: { medicines: MedicineResult[] } }>(
      `/api/doctors/me/medicines/search?q=${encodeURIComponent(q)}`
    ),

  // Prescriptions
  listPrescriptions: () =>
    api.get<{ data: { prescriptions: Prescription[] } }>('/api/doctors/me/prescriptions'),

  getPrescription: (id: string) =>
    api.get<{ data: { prescription: Prescription } }>(`/api/doctors/me/prescriptions/${id}`),

  createPrescription: (appointmentId: string, payload: CreatePrescriptionPayload) =>
    api.post<{ data: { prescription: Prescription } }>(
      `/api/doctors/me/appointments/${appointmentId}/prescriptions`,
      payload
    ),

  // Patient passport
  getPatientPassport: (patientId: string) =>
    api.get<{ data: any }>(`/api/doctors/me/patients/${patientId}/passport`),
};
