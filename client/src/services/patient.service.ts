import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PatientAppointment {
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
  doctors: { full_name: string; specialisation: string } | null;
  hospitals: { name: string; city: string } | null;
}

export interface PatientPassport {
  prescriptions: PatientPrescription[];
  reports: PatientReport[];
  grants: AccessGrant[];
}

export interface PatientPrescription {
  id: string;
  appointment_id: string;
  doctor_id: string;
  patient_id: string;
  illness_description: string | null;
  issued_at: string;
  pdf_url: string | null;
  prescription_items?: PrescriptionItem[];
  doctors?: { full_name: string; specialisation: string } | null;
  hospitals?: { name: string; city: string } | null;
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

export interface PatientReport {
  id: string;
  patient_id: string;
  hospital_id: string;
  report_type: string;
  report_name: string;
  report_url: string;
  uploaded_by: string;
  uploaded_at: string;
  hospitals?: { name: string } | null;
}

export interface AccessGrant {
  id: string;
  patient_id: string;
  granted_to_hospital_id: string | null;
  granted_to_doctor_id: string | null;
  record_types: string[];
  valid_until: string;
  created_at: string;
  hospitals?: { name: string; city: string } | null;
  doctors?: { full_name: string; specialisation: string } | null;
}

export interface WaitlistEntry {
  id: string;
  slot_id: string;
  patient_id: string;
  queued_at: string;
  notified_at: string | null;
  offer_expires_at: string | null;
  status: string;
  appointment_slots?: {
    slot_start: string;
    slot_end: string;
    doctors?: { full_name: string; specialisation: string; hospitals?: { name: string; city: string } | null } | null;
  } | null;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const patientService = {
  // Appointments
  listAppointments: (filter: 'upcoming' | 'past' | 'all' = 'all') =>
    api.get<{ data: { appointments: PatientAppointment[] } }>(
      `/api/patients/me/appointments?filter=${filter}`
    ),

  cancelAppointment: (id: string) =>
    api.patch<{ data: { appointment: PatientAppointment } }>(
      `/api/patients/me/appointments/${id}/cancel`
    ),

  // Slot booking
  lockSlot: (slot_id: string) =>
    api.post<{ data: { slot: any; locked_until: string } }>(
      '/api/patients/me/slots/lock',
      { slot_id }
    ),

  bookAppointment: (payload: {
    slot_id: string;
    doctor_id: string;
    hospital_id: string;
    service_id?: string;
    booking_type?: string;
  }) =>
    api.post<{ data: { appointment: PatientAppointment } }>(
      '/api/patients/me/appointments',
      payload
    ),

  releaseSlotLock: (slotId: string) =>
    api.patch<{ data: null }>(`/api/patients/me/slots/${slotId}/release`),

  // Waitlist
  joinWaitlist: (slot_id: string) =>
    api.post<{ data: { waitlist_entry: WaitlistEntry } }>(
      '/api/patients/me/waitlist',
      { slot_id }
    ),

  listWaitlist: () =>
    api.get<{ data: { waitlist: WaitlistEntry[] } }>('/api/patients/me/waitlist'),

  // Health passport
  getPassport: () =>
    api.get<{ data: PatientPassport }>('/api/patients/me/passport'),

  // Access grants
  listGrants: () =>
    api.get<{ data: { grants: AccessGrant[] } }>('/api/patients/me/grants'),

  createGrant: (payload: {
    granted_to_hospital_id?: string;
    granted_to_doctor_id?: string;
    record_types: string[];
    valid_days?: number;
  }) =>
    api.post<{ data: { grant: AccessGrant } }>('/api/patients/me/grants', payload),

  revokeGrant: (grantId: string) =>
    api.delete<{ data: null }>(`/api/patients/me/grants/${grantId}`),

  // Discovery
  discoverHospitals: (params: { q?: string; city?: string; speciality?: string } = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v) as [string, string][]
    ).toString();
    return api.get<{ data: { hospitals: any[]; count: number } }>(
      `/api/discover/hospitals${qs ? `?${qs}` : ''}`
    );
  },

  getHospitalDetails: (hospitalId: string) =>
    api.get<{ data: { hospital: any } }>(`/api/discover/hospitals/${hospitalId}`),

  getDoctorSlots: (doctorId: string, date?: string) =>
    api.get<{ data: { doctor: any; slots: any[] } }>(
      `/api/discover/doctors/${doctorId}/slots${date ? `?date=${date}` : ''}`
    ),
};
