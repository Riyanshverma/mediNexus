import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader';
import { PrescriptionBuilder } from '../../components/doctor/PrescriptionBuilder';
import { Button } from '../../components/ui/button';
import { ROUTES } from '../../lib/constants';
import { LuArrowLeft, LuVideo, LuMic, LuPhoneOff, LuActivity } from 'react-icons/lu';

export const Consultation: React.FC = () => {
  const { appointmentId: _appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.DOCTOR.DASHBOARD)}>
            <LuArrowLeft size={20} />
          </Button>
          <PageHeader 
            title="Active Consultation" 
            description="Alice Smith • 28 Female • A+"
          />
        </div>
        <Button variant="outline" className="text-primary border-primary/20 bg-primary/5" onClick={() => window.open(ROUTES.DOCTOR.PATIENT_PASSPORT('p2'), '_blank')}>
          <LuActivity className="mr-2 h-4 w-4" />
          View Patient Passport
        </Button>
      </div>

      <div className="flex-1 grid lg:grid-cols-5 gap-6 min-h-0">
        {/* Video Call Section */}
        <div className="lg:col-span-2 flex flex-col bg-slate-950 rounded-2xl overflow-hidden shadow-lg relative">
          <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            04:23
          </div>
          
          <div className="flex-1 relative">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80" 
              alt="Patient" 
              className="w-full h-full object-cover"
            />
            {/* PiP Doctor View */}
            <div className="absolute bottom-4 right-4 w-32 h-40 bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-700 shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80" 
                alt="Doctor" 
                className="w-full h-full object-cover scale-x-[-1]"
              />
            </div>
          </div>
          
          <div className="h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4 px-6">
            <Button variant="secondary" size="icon" className="rounded-full w-12 h-12 bg-slate-800 text-white hover:bg-slate-700 border-none">
              <LuMic size={20} />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full w-12 h-12 bg-slate-800 text-white hover:bg-slate-700 border-none">
              <LuVideo size={20} />
            </Button>
            <Button variant="destructive" size="icon" className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700">
              <LuPhoneOff size={24} />
            </Button>
          </div>
        </div>

        {/* Prescription Builder */}
        <div className="lg:col-span-3 min-h-0">
          <PrescriptionBuilder />
        </div>
      </div>
    </div>
  );
};

// Named re-export for router compatibility
export const DoctorConsultation = Consultation;
