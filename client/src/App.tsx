import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { PatientRoutes } from './router/PatientRoutes';
import { DoctorRoutes } from './router/DoctorRoutes';
import { HospitalRoutes } from './router/HospitalRoutes';
import { LuStethoscope, LuBuilding2, LuGraduationCap } from 'react-icons/lu';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center text-primary mb-8 shadow-sm border border-primary/20">
          <LuStethoscope size={40} />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
          Welcome to <span className="text-primary">MediNexus</span>
        </h1>
        
        <p className="text-xl text-muted-foreground w-full max-w-2xl mx-auto">
          The unified healthcare platform connecting patients, doctors, and hospitals through a seamless digital experience.
        </p>

        <div className="grid md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto">
          <Link to="/patient/auth" className="group block">
            <div className="bg-white p-8 rounded-2xl border shadow-sm hover:shadow-md transition-all h-full hover:border-primary/50 text-left">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LuGraduationCap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Patient Portal</h3>
              <p className="text-muted-foreground text-sm">Book appointments, manage records, and consult doctors online.</p>
            </div>
          </Link>

          <Link to="/doctor/auth" className="group block">
            <div className="bg-white p-8 rounded-2xl border shadow-sm hover:shadow-md transition-all h-full hover:border-primary/50 text-left">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LuStethoscope size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Doctor Portal</h3>
              <p className="text-muted-foreground text-sm">Manage queue, write digital prescriptions, and view patient history.</p>
            </div>
          </Link>

          <Link to="/hospital/auth" className="group block">
            <div className="bg-white p-8 rounded-2xl border shadow-sm hover:shadow-md transition-all h-full hover:border-primary/50 text-left">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LuBuilding2 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Hospital Portal</h3>
              <p className="text-muted-foreground text-sm">Manage doctor roster, unified schedules, and service catalog.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/patient/*" element={<PatientRoutes />} />
      <Route path="/doctor/*" element={<DoctorRoutes />} />
      <Route path="/hospital/*" element={<HospitalRoutes />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
