import { useEffect, useState } from 'react';
import { Clock, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { doctorService, type DoctorAppointment } from '@/services/doctor.service';
import { format, parseISO, isToday } from 'date-fns';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STATUS_COLORS: Record<string, string> = {
  booked: 'bg-blue-500/10 text-blue-500',
  checked_in: 'bg-yellow-500/10 text-yellow-600',
  in_progress: 'bg-orange-500/10 text-orange-500',
  completed: 'bg-green-500/10 text-green-600',
  cancelled: 'bg-red-500/10 text-red-400',
  no_show: 'bg-muted text-muted-foreground',
};

const NEXT_STATUSES: Record<string, string[]> = {
  booked: ['checked_in', 'no_show', 'cancelled'],
  checked_in: ['in_progress', 'no_show', 'cancelled'],
  in_progress: ['completed', 'no_show'],
  completed: [],
  cancelled: [],
  no_show: [],
};

export const DoctorQueue = () => {
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await doctorService.listAppointments('all');
      const all: DoctorAppointment[] = (res as any).data?.appointments ?? [];
      // Filter to today's appointments
      const todayAppts = all.filter((a) =>
        a.appointment_slots && isToday(parseISO(a.appointment_slots.slot_start))
      );
      // Sort by slot start
      todayAppts.sort((a, b) => {
        const aStart = a.appointment_slots?.slot_start ?? '';
        const bStart = b.appointment_slots?.slot_start ?? '';
        return aStart.localeCompare(bStart);
      });
      setAppointments(todayAppts);
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await doctorService.updateAppointmentStatus(id, status);
      toast.success(`Status updated to "${status.replace('_', ' ')}"`);
      fetchQueue();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const activeCount = appointments.filter((a) => !['completed', 'cancelled', 'no_show'].includes(a.status)).length;

  return (
    <div className="p-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-light tracking-tight">Today's Queue</h1>
        <span className="text-sm text-muted-foreground">
          {loading ? '—' : `${activeCount} active · ${appointments.length} total`}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">
          No appointments scheduled for today.
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => {
            const nextStatuses = NEXT_STATUSES[appt.status] ?? [];
            return (
              <div key={appt.id} className="bg-card rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Time */}
                <div className="shrink-0 text-center sm:text-left w-20">
                  {appt.appointment_slots && (
                    <>
                      <p className="text-lg font-light tabular-nums">
                        {format(parseISO(appt.appointment_slots.slot_start), 'h:mm')}
                        <span className="text-xs text-muted-foreground ml-1">
                          {format(parseISO(appt.appointment_slots.slot_start), 'a')}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(parseISO(appt.appointment_slots.slot_end), 'h:mm a')}
                      </p>
                    </>
                  )}
                </div>

                {/* Patient info */}
                <div className="flex-1 space-y-0.5">
                  <p className="font-medium">{appt.patients?.full_name ?? 'Patient'}</p>
                  <p className="text-sm text-muted-foreground">
                    {appt.patients?.phone_number ?? ''} · {appt.booking_type.replace('_', ' ')}
                  </p>
                  {(appt.patients?.blood_group || appt.patients?.known_allergies) && (
                    <p className="text-xs text-muted-foreground">
                      {appt.patients.blood_group && `Blood: ${appt.patients.blood_group}`}
                      {appt.patients.known_allergies && ` · Allergies: ${appt.patients.known_allergies}`}
                    </p>
                  )}
                </div>

                {/* Status + action */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[appt.status] ?? 'bg-muted text-muted-foreground'}`}>
                    {appt.status.replace('_', ' ')}
                  </span>
                  {nextStatuses.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" disabled={updating === appt.id}>
                          {updating === appt.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>Update <ChevronDown className="ml-1 h-3 w-3" /></>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {nextStatuses.map((s) => (
                          <DropdownMenuItem key={s} onClick={() => handleStatusChange(appt.id, s)}>
                            {s.replace('_', ' ')}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
