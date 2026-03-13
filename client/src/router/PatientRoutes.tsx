import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PatientLayout } from '../components/layout/PatientLayout';
import { PatientAuth } from '../pages/patient/Auth';
import { PatientDashboard } from '../pages/patient/Dashboard';
import { PatientSearch } from '../pages/patient/Search';
import { HospitalDetail } from '../pages/patient/HospitalDetail';
import { BookSlot } from '../pages/patient/BookSlot';
import { BookingConfirmed } from '../pages/patient/BookingConfirmed';
import { HealthPassport } from '../pages/patient/HealthPassport';
import { WaitlistJoined } from '../pages/patient/WaitlistJoined';
import { useAuthStore } from '../store/authStore';

const ProtectedPatientRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, role } = useAuthStore();
  if (!user || role !== 'patient') {
    return <Navigate to="/patient/auth" replace />;
  }
  return <>{children}</>;
};

export const PatientRoutes = () => {
  return (
    <Routes>
      <Route path="auth" element={<PatientAuth />} />
      <Route element={<ProtectedPatientRoute><PatientLayout /></ProtectedPatientRoute>}>
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="search" element={<PatientSearch />} />
        <Route path="hospital/:hospitalId" element={<HospitalDetail />} />
        <Route path="book/:hospitalId/:doctorId" element={<BookSlot />} />
        <Route path="booking-confirmed/:appointmentId" element={<BookingConfirmed />} />
        <Route path="waitlist-joined/:appointmentId" element={<WaitlistJoined />} />
        <Route path="health-passport" element={<HealthPassport />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route> 
    </Routes>
  );
};
