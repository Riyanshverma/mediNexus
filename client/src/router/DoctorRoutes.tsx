import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// import { DoctorLayout } from '../components/layout/DoctorLayout';
import { DoctorAuth } from '../pages/doctor/Auth';
import { DoctorDashboard } from '../pages/doctor/Dashboard';
import { DoctorConsultation } from '../pages/doctor/Consultation';
import { PatientPassportView } from '../pages/doctor/PatientPassportView';
import { DoctorSchedule } from '../pages/doctor/Schedule';
import { useAuthStore } from '../store/authStore';

const ProtectedDoctorRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, role } = useAuthStore();
  if (!user || role !== 'doctor') {
    return <Navigate to="/doctor/auth" replace />;
  }
  return <>{children}</>;
};

export const DoctorRoutes = () => {
  return (
    <Routes>
      <Route path="auth" element={<DoctorAuth />} />
      {/* <Route element={<ProtectedDoctorRoute><DoctorLayout /></ProtectedDoctorRoute>}> */}
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="consultation/:appointmentId" element={<DoctorConsultation />} />
        <Route path="patient-passport/:patientId" element={<PatientPassportView />} />
        <Route path="schedule" element={<DoctorSchedule />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      {/* </Route> */}
    </Routes>
  );
};
