// Components
import { PatientDashboardHeader } from "./patient/components/PatientDashboardHeader";
import { PatientHome } from "./patient/components/PatientHome";
import { PatientAppointments } from "./patient/components/PatientAppointments";
import { PatientHealthPassport } from "./patient/components/PatientHealthPassport";
import { WaitlistPanel } from "./patient/components/WaitlistPanel";
import {DoctorQueue} from "./doctor/components/DoctorQueue";
import {DoctorSchedule} from "./doctor/components/DoctorSchedule";
import {DoctorPrescriptions} from "./doctor/components/DoctorPrescriptions";
import { DoctorDashboardHeader } from "./doctor/components/DoctorDashboardHeader";

export { PatientDashboardHeader, PatientHome, PatientAppointments, PatientHealthPassport, WaitlistPanel, DoctorQueue, DoctorSchedule, DoctorPrescriptions, DoctorDashboardHeader };


// Pages
import { PatientDashboard } from "./patient/pages/PatientDashboard";
import AdminDashboard from "./admin/pages/AdminDashboard";
import {DoctorDashboard} from "./doctor/pages/DoctorDashboard";

export { PatientDashboard, AdminDashboard, DoctorDashboard };