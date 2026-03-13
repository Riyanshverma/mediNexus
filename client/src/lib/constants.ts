export const ROUTES = {
  LANDING: '/',
  PATIENT: {
    AUTH: '/app/auth',
    DASHBOARD: '/app/dashboard',
    SEARCH: '/app/search',
    HOSPITAL_DETAIL: (id: string) => `/app/hospital/${id}`,
    BOOK_SLOT: (doctorId: string) => `/app/book/${doctorId}`,
    BOOKING_CONFIRMED: '/app/booking/confirmed',
    WAITLIST_JOINED: '/app/waitlist/joined',
    PASSPORT: '/app/passport',
  },
  DOCTOR: {
    AUTH: '/doctor/auth',
    DASHBOARD: '/doctor/dashboard',
    CONSULTATION: (id: string) => `/doctor/consultation/${id}`,
    PATIENT_PASSPORT: (patientId: string) => `/doctor/patient/${patientId}/passport`,
    SCHEDULE: '/doctor/schedule',
  },
  HOSPITAL: {
    AUTH: '/hospital/auth',
    REGISTER: '/hospital/register',
    DASHBOARD: '/hospital/dashboard',
    DOCTORS: '/hospital/doctors',
    APPOINTMENTS: '/hospital/appointments',
    SERVICES: '/hospital/services',
  }
};

export const BOOKING_COUNTDOWN_SECONDS = 180; // 3 minutes
