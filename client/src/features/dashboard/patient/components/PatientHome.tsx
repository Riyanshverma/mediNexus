import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, FileText, Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { patientService, type PatientAppointment } from '@/services/patient.service';
import { format, parseISO } from 'date-fns';

function statusColor(status: string) {
  const map: Record<string, string> = {
    booked: 'bg-blue-500/10 text-blue-500',
    checked_in: 'bg-yellow-500/10 text-yellow-500',
    in_progress: 'bg-orange-500/10 text-orange-500',
    completed: 'bg-green-500/10 text-green-500',
    cancelled: 'bg-red-500/10 text-red-400',
    no_show: 'bg-muted text-muted-foreground',
  };
  return map[status] ?? 'bg-muted text-muted-foreground';
}

export const PatientHome = ({ setActiveTab }: { setActiveTab?: (tab: string) => void }) => {
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientService
      .listAppointments('upcoming')
      .then((res) => setUpcoming((res as any).data?.appointments ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const nextAppt = upcoming[0] ?? null;

  return (
    <div className="p-8 animate-in fade-in duration-500 max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-light tracking-tight">Welcome Back</h1>
        <p className="text-muted-foreground mt-1 text-sm">Here's a snapshot of your health activity.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Upcoming Appointments</h3>
          <p className="text-4xl font-light mt-2">{loading ? '—' : upcoming.length}</p>
        </div>
        <div
          className="bg-card rounded-xl border p-6 cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => setActiveTab?.('passport')}
        >
          <h3 className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Health Passport</h3>
          <p className="text-sm text-muted-foreground mt-3">View records, prescriptions & grants</p>
        </div>
        <div
          className="bg-card rounded-xl border p-6 cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => navigate('/patient/discover')}
        >
          <h3 className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Find a Doctor</h3>
          <p className="text-sm text-muted-foreground mt-3">Search hospitals and book slots</p>
        </div>
      </div>

      {/* Next appointment */}
      {!loading && nextAppt && (
        <div className="bg-card rounded-xl border p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Next Appointment</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setActiveTab?.('appointments')}>
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 space-y-1">
              <p className="font-medium">{nextAppt.doctors?.full_name ?? 'Doctor'}</p>
              <p className="text-sm text-muted-foreground">{nextAppt.doctors?.specialisation}</p>
              <p className="text-sm text-muted-foreground">{nextAppt.hospitals?.name}, {nextAppt.hospitals?.city}</p>
            </div>
            <div className="space-y-1 text-sm">
              {nextAppt.appointment_slots && (
                <>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(parseISO(nextAppt.appointment_slots.slot_start), 'EEE, MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {format(parseISO(nextAppt.appointment_slots.slot_start), 'h:mm a')}
                    {' – '}
                    {format(parseISO(nextAppt.appointment_slots.slot_end), 'h:mm a')}
                  </div>
                </>
              )}
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(nextAppt.status)}`}>
                {nextAppt.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="font-medium mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button variant="outline" className="h-14 flex items-center gap-3 justify-start px-5" onClick={() => navigate('/patient/discover')}>
            <Search className="h-5 w-5 text-primary" />
            <span>Find a Doctor</span>
          </Button>
          <Button variant="outline" className="h-14 flex items-center gap-3 justify-start px-5" onClick={() => setActiveTab?.('appointments')}>
            <Calendar className="h-5 w-5 text-primary" />
            <span>My Appointments</span>
          </Button>
          <Button variant="outline" className="h-14 flex items-center gap-3 justify-start px-5" onClick={() => setActiveTab?.('passport')}>
            <FileText className="h-5 w-5 text-primary" />
            <span>Health Passport</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
