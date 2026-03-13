import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatCard } from '../../components/shared/StatCard';
import { QueueCard } from '../../components/doctor/QueueCard';
import { ROUTES } from '../../lib/constants';
import { LuUsers, LuClock, LuCircleCheck, LuTrendingUp } from 'react-icons/lu';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import type { Appointment } from '../../types/appointment';
import type { Patient } from '../../types/patient';

export const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeQueueId, setActiveQueueId] = useState<string | null>('a2'); // Simulate an active consultation

  // Mock data
  const patientsQueue = [
    {
      appointment: { id: 'a1', status: 'completed', date: new Date(Date.now() - 3600000).toISOString(), symptoms: 'Follow up for BP check' } as Appointment,
      patient: { id: 'p1', name: 'John Doe', gender: 'male', bloodGroup: 'O+', avatarUrl: '' } as Patient
    },
    {
      appointment: { id: 'a2', status: 'scheduled', date: new Date().toISOString(), symptoms: 'Persistent fever and body ache' } as Appointment,
      patient: { id: 'p2', name: 'Alice Smith', gender: 'female', bloodGroup: 'A+', avatarUrl: '' } as Patient
    },
    {
      appointment: { id: 'a3', status: 'scheduled', date: new Date(Date.now() + 1800000).toISOString(), symptoms: 'Regular health checkup' } as Appointment,
      patient: { id: 'p3', name: 'Bob Johnson', gender: 'male', bloodGroup: 'B-', avatarUrl: '' } as Patient
    }
  ];

  const handleStartConsultation = (id: string) => {
    setActiveQueueId(id);
    navigate(ROUTES.DOCTOR.CONSULTATION(id));
  };

  const completed = patientsQueue.filter(p => p.appointment.status === 'completed');
  const upcoming = patientsQueue.filter(p => p.appointment.status === 'scheduled');
  
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <PageHeader 
          title="Dr. Sarah's Workspace" 
          description="Manage your consultations and patient queue for today."
        />
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none px-3 py-1 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            Accepting Walk-ins
          </Badge>
          <Button variant="outline" onClick={() => navigate(ROUTES.DOCTOR.SCHEDULE)}>
            Edit Schedule
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Appointments" value="12" icon={<LuUsers size={20} />} description="For today" />
        <StatCard title="Completed" value={completed.length.toString()} icon={<LuCircleCheck size={20} />} description={`${12 - completed.length} remaining`} />
        <StatCard title="Avg. Wait Time" value="14m" icon={<LuClock size={20} />} description="-2m from yesterday" />
        <StatCard title="Revenue" value="$850" icon={<LuTrendingUp size={20} />} description="+$120 this week" />
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="upcoming" className="gap-2">
              Queue <Badge variant="secondary" className="px-1.5 py-0 min-w-5 h-5">{upcoming.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="upcoming" className="mt-0">
          {upcoming.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((item) => (
                <QueueCard
                  key={item.appointment.id}
                  appointment={item.appointment}
                  patient={item.patient}
                  isActive={activeQueueId === item.appointment.id}
                  onStartConsultation={() => handleStartConsultation(item.appointment.id)}
                  onViewPassport={(id) => navigate(ROUTES.DOCTOR.PATIENT_PASSPORT(id))}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-xl bg-card text-muted-foreground">
              No upcoming appointments in the queue.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completed.map((item) => (
              <QueueCard
                key={item.appointment.id}
                appointment={item.appointment}
                patient={item.patient}
                onViewPassport={(id) => navigate(ROUTES.DOCTOR.PATIENT_PASSPORT(id))}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
