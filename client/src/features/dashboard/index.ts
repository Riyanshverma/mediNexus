// Components
import PatientDashboardHeader from "./patient/components/PatientDashboardHeader";
import PatientHome from "./patient/components/PatientHome";
import PatientAppointments from "./patient/components/PatientAppointments";
import PatientHealthPassport from "./patient/components/PatientHealthPassport";

import DoctorDashboardHeader from "./doctor/pages/DoctorDashboard";
import DoctorQueue from "./doctor/components/DoctorQueue";
import DoctorSchedule from "./doctor/components/DoctorSchedule";
import DoctorPrescriptions from "./doctor/components/DoctorPrescriptions";

export { PatientDashboardHeader, PatientHome, PatientAppointments, PatientHealthPassport, DoctorDashboardHeader, DoctorQueue, DoctorSchedule, DoctorPrescriptions };


// Pages
import PatientDashboard from "./patient/pages/PatientDashboard";
import AdminDashboard from "./admin/pages/AdminDashboard";
import DoctorDashboard from "./doctor/pages/DoctorDashboard";

export { PatientDashboard, AdminDashboard, DoctorDashboard };