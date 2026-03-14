import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updatePatientProfileSchema } from '../validators/patient/profile.validator.js';

import { getPatientProfile, updatePatientProfile } from '../controllers/patient/profile.controller.js';
import {
  listPatientAppointments,
  getPatientAppointment,
  cancelPatientAppointment,
} from '../controllers/patient/appointments.controller.js';
import {
  listPatientPrescriptions,
  getPatientPrescription,
} from '../controllers/patient/prescriptions.controller.js';
import { listPatientReports } from '../controllers/patient/reports.controller.js';

export const patientRouter = Router();

// All routes require authentication + patient role
patientRouter.use(authenticate, requireRole('patient'));

// ── Profile ─────────────────────────────────────────────────────────
patientRouter.get('/me', getPatientProfile);
patientRouter.patch('/me', validate(updatePatientProfileSchema), updatePatientProfile);

// ── Appointments ─────────────────────────────────────────────────────
patientRouter.get('/me/appointments', listPatientAppointments);
patientRouter.get('/me/appointments/:id', getPatientAppointment);
patientRouter.patch('/me/appointments/:id/cancel', cancelPatientAppointment);

// ── Prescriptions ────────────────────────────────────────────────────
patientRouter.get('/me/prescriptions', listPatientPrescriptions);
patientRouter.get('/me/prescriptions/:id', getPatientPrescription);

// ── Reports ──────────────────────────────────────────────────────────
patientRouter.get('/me/reports', listPatientReports);
