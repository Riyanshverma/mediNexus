import { Toaster } from '@/components/ui/sonner';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LandingPage } from '@/features/landing';
import { LoginPage, SignupPage, DoctorSetupPage } from '@/features/authentication';
import { PatientDashboard, AdminDashboard, DoctorDashboard } from '@/features/dashboard';
import { DoctorOnBoardPage } from '@/features/doctor-onboard';

const App = () => (
  <Router>
    <AuthProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          {/* ── Public routes ───────────────────────────────────────────── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />

          {/* Doctor invite setup — token arrives in URL hash, no prior auth needed */}
          <Route path="/doctor/setup" element={<DoctorSetupPage />} />

          {/* ── Protected: Patient ─────────────────────────────────────── */}
          <Route
            path="/patient/*"
            element={
              <ProtectedRoute allowedRole="patient">
                <Routes>
                  <Route path="dashboard" element={<PatientDashboard />} />
                  {/* Add more patient-specific routes here */}
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* ── Protected: Doctor ──────────────────────────────────────── */}
          <Route
            path="/doctor/*"
            element={
              <ProtectedRoute allowedRole="doctor">
                <Routes>
                  <Route path="dashboard" element={<DoctorDashboard />} />
                  {/* Add more doctor-specific routes here */}
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* ── Protected: Hospital Admin ──────────────────────────────── */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRole="hospital_admin">
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  {/* Add more admin-specific routes here */}
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster position="bottom-right" theme="dark" richColors={true} />
      </div>
    </AuthProvider>
  </Router>
);

export default App;
