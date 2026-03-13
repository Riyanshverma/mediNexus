import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/shared/StatCard';
import { AppointmentCard } from '../../components/patient/AppointmentCard';
import { ROUTES } from '../../lib/constants';
import { LuCalendarDays, LuFileText, LuActivity, LuSearch } from 'react-icons/lu';
import { Button } from '../../components/ui/button';

export const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Mock data
  const upcomingAppointment = {
    id: '1',
    patientId: 'p1',
    doctorId: 'd1',
    hospitalId: 'h1',
    slotId: 's1',
    date: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: 'scheduled' as const,
    amount: 50,
    paymentStatus: 'completed' as const,
    symptoms: 'Mild fever and cough for 3 days'
  };

  const doctor = {
    id: 'd1',
    hospitalId: 'h1',
    name: 'Dr. Sarah Smith',
    specialty: 'General Physician',
    qualification: 'MBBS, MD',
    experienceYears: 10,
    consultationFee: 50,
    rating: 4.8,
  };

  const hospital = {
    id: 'h1',
    name: 'City Care Hospital',
    address: { street: '123 Health Ave', city: 'Metropolis', state: 'NY', zipCode: '10001' },
    phone: '555-0199',
    email: 'contact@citycare.com',
    rating: 4.5,
    services: []
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 p-6 md:p-8 bg-gradient-to-r from-primary to-primary/80 rounded-2xl text-primary-foreground shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <LuActivity size={120} />
        </div>
        <h1 className="text-3xl font-bold mb-2 relative z-10">Good morning, John!</h1>
        <p className="text-primary-foreground/80 max-w-md relative z-10">
          Here is a summary of your health activities. Don't forget to stay hydrated today.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 relative z-10">
          <Button variant="secondary" onClick={() => navigate(ROUTES.PATIENT.SEARCH)}>
            <LuSearch className="mr-2 h-4 w-4" />
            Book Appointment
          </Button>
          <Button variant="outline" className="text-primary hover:text-primary-foreground hover:bg-white/20 bg-white/10 border-white/20" onClick={() => navigate(ROUTES.PATIENT.PASSPORT)}>
            Open Health Passport
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard 
          title="Upcoming Appointments" 
          value="1" 
          icon={<LuCalendarDays size={20} />} 
          description="Next on Oct 24th"
        />
        <StatCard 
          title="Health Records" 
          value="12" 
          icon={<LuFileText size={20} />} 
          description="Last updated 2w ago"
        />
        <StatCard 
          title="Active Prescriptions" 
          value="2" 
          icon={<LuActivity size={20} />} 
          description="Refills due next week"
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Your Next Appointment</h2>
        </div>
        
        <div className="max-w-3xl">
          <AppointmentCard 
            appointment={upcomingAppointment} 
            doctor={doctor} 
            hospital={hospital}
            onCancel={(id) => console.log('Cancel', id)}
            onReschedule={(id) => console.log('Reschedule', id)}
            onJoinSession={(id) => console.log('Join', id)}
          />
        </div>
      </div>
    </div>
  );
};
