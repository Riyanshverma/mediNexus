import { Toaster } from '@/components/ui/sonner'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LandingPage } from '@/features/landing'
import { LoginPage, SignupPage } from '@/features/authentication';
import { PatientDashboard, AdminDashboard, DoctorDashboard } from '@/features/dashboard';

const App = () => (
  <Router>
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignupPage />} />

         {/* Patient Routes */}
        <Route path="/patient/*" element={
          <Routes>
            <Route path="dashboard" element={<PatientDashboard />} />
            {/* Add more patient-specific routes here */}
          </Routes>
        } />

        {/* Doctor Routes */}
        <Route path="/doctor/*" element={
          <Routes>
            <Route path="dashboard" element={<DoctorDashboard />} />
            {/* Add more doctor-specific routes here */}
          </Routes>
        } />

        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            {/* Add more admin-specific routes here */}
          </Routes>
        } />
      </Routes>
      <Toaster
        position="bottom-right"
        theme="dark"
        richColors={true}
      />
    </div>
  </Router>
);

export default App;