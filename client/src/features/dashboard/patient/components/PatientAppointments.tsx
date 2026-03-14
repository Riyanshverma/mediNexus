import { useEffect, useState } from 'react';
import { Calendar, Clock, Loader2, X, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { patientService, type PatientAppointment } from '@/services/patient.service';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

type Filter = 'upcoming' | 'past' | 'all';

const STATUS_COLORS: Record<string, string> = {
  booked: 'bg-blue-500/10 text-blue-500',
  checked_in: 'bg-yellow-500/10 text-yellow-600',
  in_progress: 'bg-orange-500/10 text-orange-500',
  completed: 'bg-green-500/10 text-green-600',
  cancelled: 'bg-red-500/10 text-red-400',
  no_show: 'bg-muted text-muted-foreground',
};

const CANCELLABLE = ['booked', 'checked_in'];

export const PatientAppointments = () => {
  const [filter, setFilter] = useState<Filter>('upcoming');
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [joiningWaitlist, setJoiningWaitlist] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await patientService.listAppointments(filter);
      setAppointments((res as any).data?.appointments ?? []);
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const handleCancel = async (id: string) => {
    setCancelling(id);
    try {
      await patientService.cancelAppointment(id);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (e: any) {
      toast.error(e.message ?? 'Could not cancel appointment');
    } finally {
      setCancelling(null);
    }
  };

  const handleJoinWaitlist = async (slotId: string) => {
    setJoiningWaitlist(slotId);
    try {
      await patientService.joinWaitlist(slotId);
      toast.success("Added to waitlist");
    } catch (e: any) {
      toast.error(e.message ?? 'Could not join waitlist');
    } finally {
      setJoiningWaitlist(null);
    }
  };

  return (
    <div className="p-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-light tracking-tight">My Appointments</h1>
        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
          {(['upcoming', 'past', 'all'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors capitalize ${
                filter === f ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">
          No {filter === 'all' ? '' : filter} appointments found.
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <div key={appt.id} className="bg-card rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{appt.doctors?.full_name ?? 'Doctor'}</span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[appt.status] ?? 'bg-muted text-muted-foreground'}`}>
                    {appt.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{appt.doctors?.specialisation} — {appt.hospitals?.name}, {appt.hospitals?.city}</p>
                {appt.appointment_slots && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(parseISO(appt.appointment_slots.slot_start), 'EEE, MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {format(parseISO(appt.appointment_slots.slot_start), 'h:mm a')}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {CANCELLABLE.includes(appt.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    disabled={cancelling === appt.id}
                    onClick={() => handleCancel(appt.id)}
                  >
                    {cancelling === appt.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
