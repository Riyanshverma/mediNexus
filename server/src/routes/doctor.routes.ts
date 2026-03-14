import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateDoctorProfileSchema } from '../validators/doctor/profile.validator.js';
import { createSlotsSchema } from '../validators/doctor/slot.validator.js';
import { updateAppointmentStatusSchema } from '../validators/doctor/appointment-status.validator.js';

import { getDoctorProfile, updateDoctorProfile } from '../controllers/doctor/profile.controller.js';
import {
  listDoctorAppointments,
  getDoctorAppointment,
  updateDoctorAppointmentStatus,
} from '../controllers/doctor/appointments.controller.js';
import {
  listDoctorSlots,
  createDoctorSlots,
  deleteDoctorSlot,
  generateDoctorSlots,
  blockDoctorSlot,
  unblockDoctorSlot,
  markDoctorLeave,
} from '../controllers/doctor/slots.controller.js';
import {
  searchMedicines,
  createPrescription,
  listDoctorPrescriptions,
  getDoctorPrescription,
} from '../controllers/doctor/prescriptions.controller.js';
import { getPatientPassportForDoctor } from '../controllers/doctor/passport.controller.js';

export const doctorRouter = Router();

// All routes require authentication + doctor role
doctorRouter.use(authenticate, requireRole('doctor'));

// ── Profile ─────────────────────────────────────────────────────────
doctorRouter.get('/me', getDoctorProfile);
doctorRouter.patch('/me', validate(updateDoctorProfileSchema), updateDoctorProfile);

// ── Appointments ─────────────────────────────────────────────────────
doctorRouter.get('/me/appointments', listDoctorAppointments);
doctorRouter.get('/me/appointments/:id', getDoctorAppointment);
doctorRouter.patch(
  '/me/appointments/:id/status',
  validate(updateAppointmentStatusSchema),
  updateDoctorAppointmentStatus
);

// ── Slots ────────────────────────────────────────────────────────────
doctorRouter.get('/me/slots', listDoctorSlots);
doctorRouter.post('/me/slots', validate(createSlotsSchema), createDoctorSlots);
doctorRouter.post('/me/slots/generate', generateDoctorSlots);
doctorRouter.patch('/me/slots/:slotId/block', blockDoctorSlot);
doctorRouter.patch('/me/slots/:slotId/unblock', unblockDoctorSlot);
doctorRouter.delete('/me/slots/:slotId', deleteDoctorSlot);

// ── Leave ────────────────────────────────────────────────────────────
doctorRouter.post('/me/leave', markDoctorLeave);

// ── Medicines & Prescriptions ────────────────────────────────────────
doctorRouter.get('/me/medicines/search', searchMedicines);
doctorRouter.get('/me/prescriptions', listDoctorPrescriptions);
doctorRouter.get('/me/prescriptions/:id', getDoctorPrescription);
doctorRouter.post('/me/appointments/:appointmentId/prescriptions', createPrescription);

// ── Patient Health Passport (requires access grant) ──────────────────
doctorRouter.get('/me/patients/:patientId/passport', getPatientPassportForDoctor);
