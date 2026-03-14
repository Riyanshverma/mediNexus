import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HospitalProfile {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  registration_number: string;
  admin_id: string;
  is_approved: boolean;
  created_at: string;
}

export interface HospitalDoctor {
  id: string;
  user_id: string;
  hospital_id: string;
  full_name: string;
  specialisation: string;
  department: string | null;
  qualifications: string | null;
  registration_number: string | null;
  experience_years: number | null;
  consultation_fee: number | null;
  bio: string | null;
  available_from: string | null;
  available_to: string | null;
  slot_duration_mins: number | null;
  prescription_template: string | null;
  verified: boolean;
  created_at: string;
}

export interface HospitalService {
  id: string;
  hospital_id: string;
  service_type: string;
  service_name: string;
  department: string;
  default_duration_mins: number;
  fee: number;
  pay_at_counter: boolean;
  is_available: boolean;
}

export interface HospitalAppointment {
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
  appointment_slots?: { slot_start: string; slot_end: string } | null;
  doctors?: { full_name: string; specialisation: string } | null;
  patients?: { full_name: string; phone_number: string | null } | null;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const hospitalService = {
  // Profile
  getProfile: () =>
    api.get<{ data: { hospital: HospitalProfile } }>('/api/hospitals/me'),

  updateProfile: (payload: Partial<Pick<HospitalProfile, 'name' | 'type' | 'address' | 'city' | 'state'>>) =>
    api.patch<{ data: { hospital: HospitalProfile } }>('/api/hospitals/me', payload),

  // Doctors
  listDoctors: () =>
    api.get<{ data: { doctors: HospitalDoctor[] } }>('/api/hospitals/me/doctors'),

  updateDoctor: (doctorId: string, payload: {
    full_name?: string;
    specialisation?: string;
    department?: string;
    qualifications?: string;
    registration_number?: string;
    experience_years?: number;
    consultation_fee?: number;
    bio?: string;
    available_from?: string;
    available_to?: string;
    slot_duration_mins?: number;
    verified?: boolean;
  }) =>
    api.patch<{ data: { doctor: HospitalDoctor } }>(
      `/api/hospitals/me/doctors/${doctorId}`,
      payload
    ),

  deleteDoctor: (doctorId: string) =>
    api.delete<{ data: null }>(`/api/hospitals/me/doctors/${doctorId}`),

  // Services
  listServices: () =>
    api.get<{ data: { services: HospitalService[] } }>('/api/hospitals/me/services'),

  createService: (payload: Omit<HospitalService, 'id' | 'hospital_id'>) =>
    api.post<{ data: { service: HospitalService } }>('/api/hospitals/me/services', payload),

  updateService: (serviceId: string, payload: Partial<Omit<HospitalService, 'id' | 'hospital_id'>>) =>
    api.patch<{ data: { service: HospitalService } }>(
      `/api/hospitals/me/services/${serviceId}`,
      payload
    ),

  deleteService: (serviceId: string) =>
    api.delete<{ data: null }>(`/api/hospitals/me/services/${serviceId}`),

  // Appointments
  listAppointments: (filter?: 'upcoming' | 'past' | 'all') =>
    api.get<{ data: { appointments: HospitalAppointment[] } }>(
      `/api/hospitals/me/appointments${filter ? `?filter=${filter}` : ''}`
    ),

  // Invite doctor
  inviteDoctor: (hospitalId: string, payload: { email: string; full_name: string; specialisation: string }) =>
    api.post(`/api/hospitals/${hospitalId}/doctors/invite`, payload),

  // Slot generation on behalf of a doctor
  generateDoctorSlots: (doctorId: string, payload: {
    working_days: number[];
    start_time: string;
    end_time: string;
    slot_duration_mins: number;
    days_ahead?: number;
  }) => api.post(`/api/hospitals/me/doctors/${doctorId}/slots/generate`, payload),
};
