import { Router } from 'express';
import {
  discoverHospitals,
  getHospitalDetails,
  getDoctorSlots,
} from '../controllers/patient/discovery.controller.js';

export const discoverRouter = Router();

// Public discovery endpoints — no authentication required
discoverRouter.get('/hospitals', discoverHospitals);
discoverRouter.get('/hospitals/:hospitalId', getHospitalDetails);
discoverRouter.get('/doctors/:doctorId/slots', getDoctorSlots);
