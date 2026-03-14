import { useEffect, useState, useRef } from 'react';
import { Search, Plus, Trash2, Loader2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { doctorService, type Prescription, type MedicineResult, type DoctorAppointment } from '@/services/doctor.service';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

interface PrescriptionItemForm {
  medicine: MedicineResult | null;
  dosage: string;
  frequency: string;
  duration: string;
  doctor_comment: string;
}

export const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Create prescription dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [selectedApptId, setSelectedApptId] = useState('');
  const [illnessDescription, setIllnessDescription] = useState('');
  const [items, setItems] = useState<PrescriptionItemForm[]>([
    { medicine: null, dosage: '', frequency: '', duration: '', doctor_comment: '' },
  ]);
  const [creating, setCreating] = useState(false);

  // Medicine search per item
  const [searchQueries, setSearchQueries] = useState<string[]>(['']);
  const [searchResults, setSearchResults] = useState<MedicineResult[][]>([[]]);
  const [searchingIdx, setSearchingIdx] = useState<number | null>(null);
  const searchTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await doctorService.listPrescriptions();
      setPrescriptions((res as any).data?.prescriptions ?? []);
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentsForDialog = async () => {
    try {
      const res = await doctorService.listAppointments('past');
      const all: DoctorAppointment[] = (res as any).data?.appointments ?? [];
      // Only appointments that are in_progress or completed (can still write rx)
      setAppointments(all.filter((a) => ['booked', 'checked_in', 'in_progress', 'completed'].includes(a.status)));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleMedicineSearch = (idx: number, q: string) => {
    const updated = [...searchQueries];
    updated[idx] = q;
    setSearchQueries(updated);

    clearTimeout(searchTimers.current[idx]);
    if (!q.trim()) {
      const updatedResults = [...searchResults];
      updatedResults[idx] = [];
      setSearchResults(updatedResults);
      return;
    }

    searchTimers.current[idx] = setTimeout(async () => {
      setSearchingIdx(idx);
      try {
        const res = await doctorService.searchMedicines(q);
        const meds: MedicineResult[] = (res as any).data?.medicines ?? [];
        const updatedResults = [...searchResults];
        updatedResults[idx] = meds;
        setSearchResults(updatedResults);
      } catch {
        // ignore search errors
      } finally {
        setSearchingIdx(null);
      }
    }, 300);
  };

  const selectMedicine = (idx: number, med: MedicineResult) => {
    const updatedItems = [...items];
    updatedItems[idx] = { ...updatedItems[idx], medicine: med };
    setItems(updatedItems);

    const updatedQueries = [...searchQueries];
    updatedQueries[idx] = med.medicine_name;
    setSearchQueries(updatedQueries);

    const updatedResults = [...searchResults];
    updatedResults[idx] = [];
    setSearchResults(updatedResults);
  };

  const updateItem = (idx: number, field: keyof PrescriptionItemForm, value: string) => {
    const updated = [...items];
    (updated[idx] as any)[field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { medicine: null, dosage: '', frequency: '', duration: '', doctor_comment: '' }]);
    setSearchQueries([...searchQueries, '']);
    setSearchResults([...searchResults, []]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
    setSearchQueries(searchQueries.filter((_, i) => i !== idx));
    setSearchResults(searchResults.filter((_, i) => i !== idx));
  };

  const handleCreate = async () => {
    if (!selectedApptId) {
      toast.error('Select an appointment');
      return;
    }
    const validItems = items.filter((it) => it.medicine && it.dosage && it.frequency && it.duration);
    if (validItems.length === 0) {
      toast.error('Add at least one complete medicine item');
      return;
    }

    setCreating(true);
    try {
      await doctorService.createPrescription(selectedApptId, {
        illness_description: illnessDescription || undefined,
        items: validItems.map((it) => ({
          medicine_id: it.medicine!.id,
          dosage: it.dosage,
          frequency: it.frequency,
          duration: it.duration,
          doctor_comment: it.doctor_comment || undefined,
        })),
      });
      toast.success('Prescription created');
      setCreateOpen(false);
      setSelectedApptId('');
      setIllnessDescription('');
      setItems([{ medicine: null, dosage: '', frequency: '', duration: '', doctor_comment: '' }]);
      setSearchQueries(['']);
      setSearchResults([[]]);
      fetchPrescriptions();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to create prescription');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-light tracking-tight">Prescriptions</h1>
        <Button
          size="sm"
          onClick={() => {
            fetchAppointmentsForDialog();
            setCreateOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> New Prescription
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">
          No prescriptions issued yet.
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="bg-card rounded-xl border overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setExpandedId(expandedId === rx.id ? null : rx.id)}
              >
                <div>
                  <p className="font-medium">{rx.illness_description ?? 'Prescription'}</p>
                  <p className="text-sm text-muted-foreground">
                    Patient: {(rx as any).patients?.full_name ?? rx.patient_id} ·{' '}
                    {format(parseISO(rx.issued_at), 'MMM d, yyyy')}
                  </p>
                </div>
                {expandedId === rx.id ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {expandedId === rx.id && (
                <div className="border-t px-5 pb-5 space-y-2">
                  {(rx.prescription_items ?? []).map((item: any) => (
                    <div key={item.id} className="flex items-start justify-between py-2 border-b last:border-0 text-sm">
                      <div>
                        <p className="font-medium">{item.medicines?.medicine_name ?? item.medicine_id}</p>
                        {item.doctor_comment && (
                          <p className="text-xs text-muted-foreground">{item.doctor_comment}</p>
                        )}
                      </div>
                      <div className="text-right text-muted-foreground text-xs space-y-0.5">
                        <p>{item.dosage}</p>
                        <p>{item.frequency} · {item.duration}</p>
                      </div>
                    </div>
                  ))}
                  {(rx.prescription_items ?? []).length === 0 && (
                    <p className="text-sm text-muted-foreground py-2">No medicine items</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create prescription dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Prescription</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            {/* Appointment selector */}
            <div className="space-y-2">
              <Label>Appointment</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedApptId}
                onChange={(e) => setSelectedApptId(e.target.value)}
              >
                <option value="">Select appointment…</option>
                {appointments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.patients?.full_name ?? 'Patient'} —{' '}
                    {a.appointment_slots
                      ? format(parseISO(a.appointment_slots.slot_start), 'MMM d, h:mm a')
                      : a.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </div>

            {/* Illness description */}
            <div className="space-y-2">
              <Label>Diagnosis / Illness Description</Label>
              <Textarea
                placeholder="Brief description of diagnosis..."
                className="resize-none h-20"
                value={illnessDescription}
                onChange={(e) => setIllnessDescription(e.target.value)}
              />
            </div>

            {/* Medicine items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Medicines</Label>
                <Button variant="outline" size="sm" onClick={addItem} type="button">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="rounded-lg border p-4 space-y-3">
                  {/* Medicine search */}
                  <div className="space-y-1 relative">
                    <Label className="text-xs">Medicine {idx + 1}</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        placeholder="Search medicine..."
                        value={searchQueries[idx] ?? ''}
                        onChange={(e) => handleMedicineSearch(idx, e.target.value)}
                      />
                      {searchingIdx === idx && (
                        <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    {(searchResults[idx] ?? []).length > 0 && (
                      <div className="absolute z-10 w-full bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto mt-1">
                        {(searchResults[idx] ?? []).map((med) => (
                          <button
                            key={med.id}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                            onClick={() => selectMedicine(idx, med)}
                            type="button"
                          >
                            <span className="font-medium">{med.medicine_name}</span>
                            {med.therapeutic_class && (
                              <span className="text-xs text-muted-foreground ml-2">({med.therapeutic_class})</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Dosage</Label>
                      <Input placeholder="e.g., 500mg" value={item.dosage} onChange={(e) => updateItem(idx, 'dosage', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Frequency</Label>
                      <Input placeholder="e.g., twice daily" value={item.frequency} onChange={(e) => updateItem(idx, 'frequency', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Duration</Label>
                      <Input placeholder="e.g., 7 days" value={item.duration} onChange={(e) => updateItem(idx, 'duration', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Note (optional)</Label>
                    <Input placeholder="Doctor's note..." value={item.doctor_comment} onChange={(e) => updateItem(idx, 'doctor_comment', e.target.value)} />
                  </div>
                  {items.length > 1 && (
                    <button
                      className="text-xs text-destructive flex items-center gap-1 hover:underline"
                      onClick={() => removeItem(idx)}
                      type="button"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Button onClick={handleCreate} disabled={creating} className="w-full">
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
              Issue Prescription
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
