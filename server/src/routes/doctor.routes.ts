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
} from '../controllers/doctor/slots.controller.js';

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
doctorRouter.delete('/me/slots/:slotId', deleteDoctorSlot);
