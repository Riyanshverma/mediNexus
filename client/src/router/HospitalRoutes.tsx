import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HospitalLayout } from '../components/layout/HospitalLayout';
import { HospitalAuth } from '../pages/hospital/Auth';
import { HospitalRegister } from '../pages/hospital/Register';
import { HospitalDashboard } from '../pages/hospital/Dashboard';
import { HospitalDoctors } from '../pages/hospital/Doctors';
import { HospitalAppointments } from '../pages/hospital/Appointments';
import { HospitalServices } from '../pages/hospital/Services';
import { useAuthStore } from '../store/authStore';

const ProtectedHospitalRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, role } = useAuthStore();
  if (!user || role !== 'hospital') {
    return <Navigate to="/hospital/auth" replace />;
  }
  return <>{children}</>;
};

export const HospitalRoutes = () => {
  return (
    <Routes>
      <Route path="auth" element={<HospitalAuth />} />
      <Route path="register" element={<HospitalRegister />} />
      <Route element={<ProtectedHospitalRoute><HospitalLayout /></ProtectedHospitalRoute>}>
        <Route path="dashboard" element={<HospitalDashboard />} />
        <Route path="doctors" element={<HospitalDoctors />} />
        <Route path="appointments" element={<HospitalAppointments />} />
        <Route path="services" element={<HospitalServices />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};
