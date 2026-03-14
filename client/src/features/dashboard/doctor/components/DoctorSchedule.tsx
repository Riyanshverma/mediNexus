import { useEffect, useState } from 'react';
import { Calendar, Loader2, Lock, Unlock, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doctorService, type DoctorSlot } from '@/services/doctor.service';
import { format, parseISO, startOfDay, endOfDay, addDays, subDays, isToday } from 'date-fns';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-500/10 text-green-600 border-green-200',
  booked: 'bg-blue-500/10 text-blue-500 border-blue-200',
  locked: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  cancelled: 'bg-muted text-muted-foreground border-muted',
  blocked: 'bg-red-500/10 text-red-400 border-red-200',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DoctorSchedule = () => {
  const [slots, setSlots] = useState<DoctorSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Generate form state
  const [genOpen, setGenOpen] = useState(false);
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(15);
  const [daysAhead, setDaysAhead] = useState(30);
  const [generating, setGenerating] = useState(false);

  // Leave form
  const [leaveDate, setLeaveDate] = useState('');
  const [markingLeave, setMarkingLeave] = useState(false);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await doctorService.listSlots(false);
      setSlots((res as any).data?.slots ?? []);
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const slotsForDay = slots.filter((s) => {
    const slotDate = parseISO(s.slot_start);
    return (
      slotDate >= startOfDay(viewDate) && slotDate <= endOfDay(viewDate)
    );
  }).sort((a, b) => a.slot_start.localeCompare(b.slot_start));

  const handleBlock = async (slotId: string) => {
    setActionLoading(slotId);
    try {
      await doctorService.blockSlot(slotId);
      toast.success('Slot blocked');
      fetchSlots();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to block slot');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblock = async (slotId: string) => {
    setActionLoading(slotId);
    try {
      await doctorService.unblockSlot(slotId);
      toast.success('Slot unblocked');
      fetchSlots();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to unblock slot');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerate = async () => {
    if (workingDays.length === 0) {
      toast.error('Select at least one working day');
      return;
    }
    setGenerating(true);
    try {
      const res = await doctorService.generateSlots({
        working_days: workingDays,
        start_time: startTime,
        end_time: endTime,
        slot_duration_mins: slotDuration,
        days_ahead: daysAhead,
      });
      const { generated, attempted } = (res as any).data ?? {};
      toast.success(`Generated ${generated} of ${attempted} slot(s)`);
      setGenOpen(false);
      fetchSlots();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to generate slots');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkLeave = async () => {
    if (!leaveDate) {
      toast.error('Select a leave date');
      return;
    }
    setMarkingLeave(true);
    try {
      const res = await doctorService.markLeave(leaveDate);
      const { blocked } = (res as any).data ?? {};
      toast.success(`${blocked} slot(s) blocked for leave day`);
      setLeaveDate('');
      fetchSlots();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to mark leave');
    } finally {
      setMarkingLeave(false);
    }
  };

  const toggleWorkingDay = (day: number) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="p-8 animate-in fade-in duration-500 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-light tracking-tight">Schedule Management</h1>
        <Button variant="outline" size="sm" onClick={() => setGenOpen((v) => !v)}>
          <RefreshCw className="h-4 w-4 mr-2" /> Generate Slots
        </Button>
      </div>

      {/* Generate form */}
      {genOpen && (
        <div className="bg-card rounded-xl border p-6 space-y-4 animate-in fade-in">
          <h2 className="font-medium">Generate Recurring Slots</h2>
          <div className="space-y-2">
            <Label>Working Days</Label>
            <div className="flex gap-2">
              {DAYS.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleWorkingDay(i)}
                  className={`w-10 h-10 rounded-lg text-sm border transition-colors ${
                    workingDays.includes(i)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {d[0]}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Slot Duration</Label>
              <Select value={String(slotDuration)} onValueChange={(v) => setSlotDuration(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 15, 20, 30, 60].map((d) => (
                    <SelectItem key={d} value={String(d)}>{d} mins</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Days Ahead</Label>
              <Input type="number" min={1} max={90} value={daysAhead} onChange={(e) => setDaysAhead(Number(e.target.value))} />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Generate
            </Button>
            <Button variant="outline" onClick={() => setGenOpen(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Mark leave */}
      <div className="bg-card rounded-xl border p-5 flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="space-y-2 flex-1">
          <Label>Mark Leave Day</Label>
          <Input type="date" value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} />
        </div>
        <Button variant="outline" onClick={handleMarkLeave} disabled={markingLeave}>
          {markingLeave ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Calendar className="h-4 w-4 mr-2" />}
          Block All Slots
        </Button>
      </div>

      {/* Day navigation */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setViewDate((d) => subDays(d, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium min-w-40 text-center">
          {isToday(viewDate) ? 'Today' : format(viewDate, 'EEE, MMM d, yyyy')}
        </span>
        <Button variant="ghost" size="icon" onClick={() => setViewDate((d) => addDays(d, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setViewDate(new Date())}>
          Today
        </Button>
        <span className="ml-auto text-sm text-muted-foreground">{slotsForDay.length} slot(s)</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : slotsForDay.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">
          No slots for this day. Generate slots above to get started.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {slotsForDay.map((slot) => {
            const colorClass = STATUS_COLORS[slot.status] ?? 'bg-muted text-muted-foreground border-muted';
            const isBlocked = slot.status === 'blocked';
            const isAvailable = slot.status === 'available';
            return (
              <div
                key={slot.id}
                className={`rounded-lg border p-3 space-y-2 ${colorClass}`}
              >
                <div className="text-sm font-medium">
                  {format(parseISO(slot.slot_start), 'h:mm a')}
                  <span className="text-xs font-normal ml-1 opacity-70">
                    – {format(parseISO(slot.slot_end), 'h:mm a')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs capitalize opacity-80">{slot.status}</span>
                  {(isAvailable || isBlocked) && (
                    <button
                      className="opacity-70 hover:opacity-100 transition-opacity"
                      disabled={actionLoading === slot.id}
                      onClick={() => isAvailable ? handleBlock(slot.id) : handleUnblock(slot.id)}
                    >
                      {actionLoading === slot.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : isAvailable ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        <Unlock className="h-3 w-3" />
                      )}
                    </button>
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
