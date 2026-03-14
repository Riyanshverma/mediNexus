import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { inviteDoctorSchema } from '../validators/auth/doctor.validator.js';
import { updateHospitalProfileSchema } from '../validators/hospital/profile.validator.js';
import { createServiceSchema, updateServiceSchema } from '../validators/hospital/service.validator.js';

import { inviteDoctor } from '../controllers/auth/doctor.controller.js';
import { getHospitalProfile, updateHospitalProfile } from '../controllers/hospital/profile.controller.js';
import { listHospitalDoctors, updateHospitalDoctor, deleteHospitalDoctor } from '../controllers/hospital/doctors.controller.js';
import { listHospitalServices, createHospitalService, updateHospitalService, deleteHospitalService } from '../controllers/hospital/services.controller.js';
import { listHospitalAppointments } from '../controllers/hospital/appointments.controller.js';
import { generateHospitalDoctorSlots } from '../controllers/hospital/slots.controller.js';

export const hospitalRouter = Router();

// POST /api/hospitals/:hospitalId/doctors/invite
hospitalRouter.post(
  '/:hospitalId/doctors/invite',
  authenticate,
  requireRole('hospital_admin'),
  validate(inviteDoctorSchema),
  inviteDoctor
);

// All /me/* routes require authentication + hospital_admin role
hospitalRouter.use('/me', authenticate, requireRole('hospital_admin'));

// Profile
hospitalRouter.get('/me', getHospitalProfile);
hospitalRouter.patch('/me', validate(updateHospitalProfileSchema), updateHospitalProfile);

// Doctors
hospitalRouter.get('/me/doctors', listHospitalDoctors);
hospitalRouter.patch('/me/doctors/:doctorId', updateHospitalDoctor);
hospitalRouter.delete('/me/doctors/:doctorId', deleteHospitalDoctor);

// Doctor slot generation (admin on behalf of doctor)
hospitalRouter.post('/me/doctors/:doctorId/slots/generate', generateHospitalDoctorSlots);

// Services
hospitalRouter.get('/me/services', listHospitalServices);
hospitalRouter.post('/me/services', validate(createServiceSchema), createHospitalService);
hospitalRouter.patch('/me/services/:serviceId', validate(updateServiceSchema), updateHospitalService);
hospitalRouter.delete('/me/services/:serviceId', deleteHospitalService);

// Appointments
hospitalRouter.get('/me/appointments', listHospitalAppointments);
