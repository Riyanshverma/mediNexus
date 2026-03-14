import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  MapPin,
  Calendar,
  Clock,
  Building2,
  Stethoscope,
  CheckCircle2,
  X,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconHeartbeat } from '@tabler/icons-react';
import { useAuth } from '@/context/AuthContext';
import { patientService } from '@/services/patient.service';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { useSlotStream, type SlotUpdatePayload } from '@/hooks/useSlotStream';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiscoverHospital {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  is_approved: boolean;
  has_slots_today: boolean;
  hospital_services?: { id: string; service_name: string; department: string }[];
  doctors?: { id: string; full_name: string; specialisation: string; verified: boolean }[];
}

interface Slot {
  id: string;
  doctor_id: string;
  slot_start: string;
  slot_end: string;
  status: string;
}

type Step = 'search' | 'hospital' | 'slots' | 'confirm' | 'done';

// ─── Component ────────────────────────────────────────────────────────────────

const PatientDiscover = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Search state
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [specFilter, setSpecFilter] = useState('');
  const [hospitals, setHospitals] = useState<DiscoverHospital[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Step navigation
  const [step, setStep] = useState<Step>('search');
  const [selectedHospital, setSelectedHospital] = useState<DiscoverHospital | null>(null);
  const [hospitalDetail, setHospitalDetail] = useState<DiscoverHospital | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<{ id: string; full_name: string; specialisation: string } | null>(null);
  const [slotDate, setSlotDate] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Booking state
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [bookedAppt, setBookedAppt] = useState<any>(null);

  // ── Real-time slot stream ──
  // `streamConnected` is purely cosmetic — shows a live indicator badge.
  const [streamConnected, setStreamConnected] = useState(false);

  // Active doctor + date being watched (empty strings = stream paused)
  const streamDoctorId = step === 'slots' && selectedDoctor ? selectedDoctor.id : '';
  const streamDate     = step === 'slots' ? (slotDate || format(new Date(), 'yyyy-MM-dd')) : '';

  useSlotStream(streamDoctorId, streamDate, (payload: SlotUpdatePayload) => {
    setStreamConnected(true); // at least one event received = definitely live

    setSlots((prev) => {
      if (payload.event === 'DELETE') {
        // Row hard-deleted — remove it
        return prev.filter((s) => s.id !== payload.slot.id);
      }

      if (payload.event === 'INSERT') {
        // New slot created — add if available and not already present
        if (payload.slot.status !== 'available') return prev;
        if (prev.some((s) => s.id === payload.slot.id)) return prev;
        const newSlot: Slot = {
          id: payload.slot.id,
          doctor_id: payload.slot.doctor_id,
          slot_start: payload.slot.slot_start,
          slot_end: payload.slot.slot_end,
          status: payload.slot.status,
        };
        return [...prev, newSlot].sort(
          (a, b) => new Date(a.slot_start).getTime() - new Date(b.slot_start).getTime()
        );
      }

      // UPDATE — most common path
      const { id, status } = payload.slot;

      if (status !== 'available') {
        // Slot is now booked / locked / cancelled — remove from grid
        // Also clear the selection if the user had picked this slot
        if (selectedSlot?.id === id) {
          setSelectedSlot(null);
          setLockedUntil(null);
          toast.warning('The slot you selected was just taken. Please choose another.');
        }
        return prev.filter((s) => s.id !== id);
      }

      // Status flipped back to available (e.g. lock expired, booking cancelled)
      const existing = prev.find((s) => s.id === id);
      if (existing) {
        return prev.map((s) => (s.id === id ? { ...s, status } : s));
      }
      // Slot re-appeared — add it back
      const restored: Slot = {
        id: payload.slot.id,
        doctor_id: payload.slot.doctor_id,
        slot_start: payload.slot.slot_start,
        slot_end: payload.slot.slot_end,
        status: payload.slot.status,
      };
      return [...prev, restored].sort(
        (a, b) => new Date(a.slot_start).getTime() - new Date(b.slot_start).getTime()
      );
    });
  });

  // ── Search ──
  const doSearch = useCallback(() => {
    setSearchLoading(true);
    patientService
      .discoverHospitals({ q: query, city: cityFilter, speciality: specFilter })
      .then(res => setHospitals((res as any).data?.hospitals ?? []))
      .catch(() => toast.error('Search failed'))
      .finally(() => setSearchLoading(false));
  }, [query, cityFilter, specFilter]);

  // Initial search on mount
  useEffect(() => { doSearch(); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced auto-search whenever query/city/speciality changes (300 ms)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { doSearch(); }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, cityFilter, specFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Hospital detail ──
  const openHospital = async (h: DiscoverHospital) => {
    setSelectedHospital(h);
    setStep('hospital');
    try {
      const res = await patientService.getHospitalDetails(h.id);
      setHospitalDetail((res as any).data?.hospital ?? null);
    } catch {
      toast.error('Failed to load hospital details');
    }
  };

  // ── Doctor slots ──
  const openDoctorSlots = async (doc: { id: string; full_name: string; specialisation: string }) => {
    setSelectedDoctor(doc);
    setSelectedSlot(null);
    setSlots([]);
    setStreamConnected(false);
    setStep('slots');
    const date = slotDate || format(new Date(), 'yyyy-MM-dd');
    setSlotsLoading(true);
    try {
      const res = await patientService.getDoctorSlots(doc.id, date);
      setSlots((res as any).data?.slots ?? []);
    } catch {
      toast.error('Failed to load slots');
    } finally {
      setSlotsLoading(false);
    }
  };

  const reloadSlots = async (date: string) => {
    if (!selectedDoctor) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    setStreamConnected(false);
    try {
      const res = await patientService.getDoctorSlots(selectedDoctor.id, date);
      setSlots((res as any).data?.slots ?? []);
    } catch {
      toast.error('Failed to load slots');
    } finally {
      setSlotsLoading(false);
    }
  };

  // ── Select slot → lock ──
  const selectSlot = async (slot: Slot) => {
    // Release previous lock if any
    if (selectedSlot) {
      patientService.releaseSlotLock(selectedSlot.id).catch(() => {});
    }
    setSelectedSlot(slot);
    try {
      const res = await patientService.lockSlot(slot.id);
      setLockedUntil((res as any).data?.locked_until ?? null);
    } catch (err: any) {
      const msg = err?.message ?? 'Failed to lock slot';
      toast.error(msg);
      setSelectedSlot(null);
      // Refresh slots so the now-taken slot disappears
      reloadSlots(slotDate || format(new Date(), 'yyyy-MM-dd'));
    }
  };

  // ── Confirm booking ──
  const confirmBooking = async () => {
    if (!selectedSlot || !selectedDoctor || !selectedHospital) return;
    setBooking(true);
    try {
      // Best-effort: find a matching hospital service for the doctor's specialisation
      const services = hospitalDetail?.hospital_services ?? selectedHospital.hospital_services ?? [];
      const matchedService = services.find(
        (s) => s.department?.toLowerCase().includes(selectedDoctor.specialisation?.toLowerCase())
          || selectedDoctor.specialisation?.toLowerCase().includes(s.department?.toLowerCase())
      ) ?? services[0] ?? null;

      const res = await patientService.bookAppointment({
        slot_id: selectedSlot.id,
        doctor_id: selectedDoctor.id,
        hospital_id: selectedHospital.id,
        ...(matchedService ? { service_id: matchedService.id } : {}),
        booking_type: 'online',
      });
      setBookedAppt((res as any).data?.appointment ?? null);
      setStep('done');
      toast.success('Appointment booked!');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  const resetToSearch = () => {
    setStep('search');
    setSelectedHospital(null);
    setHospitalDetail(null);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setLockedUntil(null);
    setBookedAppt(null);
    setSlots([]);
    setStreamConnected(false);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step !== 'search' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (step === 'done') { resetToSearch(); return; }
                  if (step === 'confirm') { setStep('slots'); return; }
                  if (step === 'slots') { setStep('hospital'); return; }
                  if (step === 'hospital') { setStep('search'); return; }
                }}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div
              className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80"
              onClick={() => navigate('/patient/dashboard')}
            >
              <IconHeartbeat className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl font-light">
                mediNexus
                <span className="text-sm font-medium text-muted-foreground ml-1">Discover</span>
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/patient/dashboard')}>
            <X className="h-4 w-4 mr-1" /> Close
          </Button>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto p-6 space-y-6">

        {/* ── Step: Search ── */}
        {step === 'search' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h1 className="text-3xl font-light tracking-tight">Find a Doctor</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Search hospitals near you and book an appointment.
              </p>
            </div>

            {/* Search filters */}
            <div className="bg-card rounded-xl border p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1 space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input
                      placeholder="Doctor, hospital, speciality…"
                      className="pl-9"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && doSearch()}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">City</Label>
                  <Input
                    placeholder="e.g. Mumbai"
                    value={cityFilter}
                    onChange={e => setCityFilter(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && doSearch()}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Speciality</Label>
                  <Input
                    placeholder="e.g. Cardiology"
                    value={specFilter}
                    onChange={e => setSpecFilter(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && doSearch()}
                  />
                </div>
              </div>
              <Button onClick={doSearch} disabled={searchLoading} className="w-full sm:w-auto">
                <Search className="h-4 w-4 mr-2" />
                {searchLoading ? 'Searching…' : 'Search'}
              </Button>
            </div>

            {/* Results */}
            {searchLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : hospitals.length === 0 ? (
              <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">
                <Building2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No hospitals found.</p>
                <p className="text-sm mt-1">Try adjusting your search filters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{hospitals.length} hospital{hospitals.length !== 1 ? 's' : ''} found</p>
                {hospitals.map(h => (
                  <div
                    key={h.id}
                    className="bg-card rounded-xl border p-4 cursor-pointer hover:border-primary/40 transition-colors"
                    onClick={() => openHospital(h)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{h.name}</p>
                          <span className="text-xs capitalize text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                            {h.type?.replace('_', ' ')}
                          </span>
                          {h.has_slots_today && (
                            <span className="text-xs bg-green-500/10 text-green-600 rounded px-1.5 py-0.5">
                              Slots today
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {h.address}, {h.city}, {h.state}
                        </div>
                        {h.doctors && h.doctors.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {h.doctors.length} doctor{h.doctors.length !== 1 ? 's' : ''} · {[...new Set(h.doctors.map(d => d.specialisation))].slice(0, 3).join(', ')}
                          </p>
                        )}
                      </div>
                      <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180 shrink-0 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step: Hospital Detail ── */}
        {step === 'hospital' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h1 className="text-3xl font-light tracking-tight">
                {hospitalDetail?.name ?? selectedHospital?.name}
              </h1>
              <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                <MapPin className="h-4 w-4 shrink-0" />
                {(hospitalDetail ?? selectedHospital)?.address},{' '}
                {(hospitalDetail ?? selectedHospital)?.city},{' '}
                {(hospitalDetail ?? selectedHospital)?.state}
              </div>
            </div>

            {/* Services */}
            {hospitalDetail?.hospital_services && hospitalDetail.hospital_services.length > 0 && (
              <div className="bg-card rounded-xl border p-4 space-y-3">
                <h2 className="font-medium flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" /> Services
                </h2>
                <div className="flex flex-wrap gap-2">
                  {hospitalDetail.hospital_services.map((svc, i) => (
                    <span
                      key={i}
                      className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs"
                    >
                      {svc.service_name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Doctors */}
            <div className="space-y-3">
              <h2 className="font-medium">Select a Doctor</h2>
              {!hospitalDetail ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (hospitalDetail.doctors ?? []).length === 0 ? (
                <div className="bg-card rounded-xl border p-8 text-center text-muted-foreground">
                  <p>No doctors available at this hospital.</p>
                </div>
              ) : (
                (hospitalDetail.doctors ?? []).map(doc => (
                  <div
                    key={doc.id}
                    className="bg-card rounded-xl border p-4 cursor-pointer hover:border-primary/40 transition-colors flex items-center justify-between gap-4"
                    onClick={() => openDoctorSlots(doc)}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{doc.full_name}</p>
                        {doc.verified && (
                          <span className="text-xs bg-green-500/10 text-green-600 rounded px-1.5 py-0.5">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{doc.specialisation}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      View Slots
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Step: Doctor Slots ── */}
        {step === 'slots' && selectedDoctor && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-light tracking-tight">{selectedDoctor.full_name}</h1>
                {/* Live indicator — shown once the SSE stream delivers its first event */}
                {streamConnected && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-green-500/10 text-green-600 rounded-full px-2.5 py-1 font-medium">
                    <Radio className="h-3 w-3 animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                {selectedDoctor.specialisation} · {selectedHospital?.name}
              </p>
            </div>

            {/* Date picker */}
            <div className="bg-card rounded-xl border p-4 flex items-end gap-4">
              <div className="space-y-1.5 flex-1">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 inline mr-1" /> Select Date
                </Label>
                <Input
                  type="date"
                  value={slotDate}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={e => {
                    setSlotDate(e.target.value);
                    reloadSlots(e.target.value);
                  }}
                />
              </div>
            </div>

            {/* Slots grid */}
            {slotsLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <div className="bg-card rounded-xl border p-10 text-center text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p>No available slots{slotDate ? ` on ${format(parseISO(slotDate), 'MMM d')}` : ''}.</p>
                <p className="text-sm mt-1">Try a different date.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {slots.length} slot{slots.length !== 1 ? 's' : ''} available
                  {streamConnected && (
                    <span className="ml-2 text-green-600">· updating live</span>
                  )}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {slots.map(slot => {
                    const isSelected = selectedSlot?.id === slot.id;
                    return (
                      <button
                        key={slot.id}
                        onClick={() => selectSlot(slot)}
                        className={`rounded-lg border p-3 text-sm transition-colors text-center ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'bg-card hover:border-primary/40 text-foreground'
                        }`}
                      >
                        <div className="font-medium">
                          {format(parseISO(slot.slot_start), 'h:mm a')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {format(parseISO(slot.slot_start), 'MMM d')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedSlot && (
              <div className="sticky bottom-4 bg-card border rounded-xl p-4 flex items-center justify-between gap-4 shadow-lg">
                <div className="text-sm">
                  <p className="font-medium">
                    {format(parseISO(selectedSlot.slot_start), 'EEE, MMM d')} at{' '}
                    {format(parseISO(selectedSlot.slot_start), 'h:mm a')}
                  </p>
                  {lockedUntil && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Held until {format(parseISO(lockedUntil), 'h:mm:ss a')}
                    </p>
                  )}
                </div>
                <Button onClick={() => setStep('confirm')}>
                  Continue
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── Step: Confirm ── */}
        {step === 'confirm' && selectedSlot && selectedDoctor && selectedHospital && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h1 className="text-3xl font-light tracking-tight">Confirm Booking</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Review your appointment details before confirming.
              </p>
            </div>

            <div className="bg-card rounded-xl border divide-y">
              {[
                ['Hospital', selectedHospital.name],
                ['Doctor', selectedDoctor.full_name],
                ['Specialisation', selectedDoctor.specialisation],
                ['Date', format(parseISO(selectedSlot.slot_start), 'EEEE, MMMM d, yyyy')],
                ['Time', `${format(parseISO(selectedSlot.slot_start), 'h:mm a')} – ${format(parseISO(selectedSlot.slot_end), 'h:mm a')}`],
                ['Type', 'Online Booking'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between px-5 py-3.5 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>

            {lockedUntil && (
              <p className="text-xs text-muted-foreground text-center">
                This slot is reserved for you until {format(parseISO(lockedUntil), 'h:mm:ss a')}.
              </p>
            )}

            <Button
              className="w-full h-12"
              onClick={confirmBooking}
              disabled={booking}
            >
              {booking ? 'Booking…' : 'Confirm Appointment'}
            </Button>
          </div>
        )}

        {/* ── Step: Done ── */}
        {step === 'done' && (
          <div className="space-y-6 animate-in fade-in duration-300 text-center py-12">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h1 className="text-3xl font-light tracking-tight">Appointment Booked!</h1>
              <p className="text-muted-foreground text-sm mt-2">
                Your appointment has been confirmed.
              </p>
            </div>

            {bookedAppt?.appointment_slots && (
              <div className="bg-card rounded-xl border p-5 text-left max-w-sm mx-auto space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(parseISO(bookedAppt.appointment_slots.slot_start), 'EEE, MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {format(parseISO(bookedAppt.appointment_slots.slot_start), 'h:mm a')}
                  {' – '}
                  {format(parseISO(bookedAppt.appointment_slots.slot_end), 'h:mm a')}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={resetToSearch}>
                Book Another
              </Button>
              <Button onClick={() => navigate('/patient/dashboard', { state: { tab: 'appointments' } })}>
                View Appointments
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientDiscover;
