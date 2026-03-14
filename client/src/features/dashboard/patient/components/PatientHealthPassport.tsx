import { useEffect, useState } from 'react';
import { FileText, Pill, Share2, Loader2, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { patientService, type PatientPassport, type AccessGrant } from '@/services/patient.service';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PassportTab = 'prescriptions' | 'reports' | 'grants';

export const PatientHealthPassport = () => {
  const [tab, setTab] = useState<PassportTab>('prescriptions');
  const [passport, setPassport] = useState<PatientPassport | null>(null);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  // Grant creation dialog state
  const [grantOpen, setGrantOpen] = useState(false);
  const [grantHospitalId, setGrantHospitalId] = useState('');
  const [grantDoctorId, setGrantDoctorId] = useState('');
  const [grantRecordTypes, setGrantRecordTypes] = useState('prescriptions,reports');
  const [creatingGrant, setCreatingGrant] = useState(false);

  const fetchPassport = async () => {
    setLoading(true);
    try {
      const res = await patientService.getPassport();
      setPassport((res as any).data as PatientPassport);
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to load health passport');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassport();
  }, []);

  const handleRevoke = async (grantId: string) => {
    setRevoking(grantId);
    try {
      await patientService.revokeGrant(grantId);
      toast.success('Access grant revoked');
      fetchPassport();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to revoke grant');
    } finally {
      setRevoking(null);
    }
  };

  const handleCreateGrant = async () => {
    const record_types = grantRecordTypes.split(',').map((s) => s.trim()).filter(Boolean);
    if (record_types.length === 0) {
      toast.error('Enter at least one record type');
      return;
    }
    if (!grantHospitalId && !grantDoctorId) {
      toast.error('Provide either a Hospital ID or Doctor ID');
      return;
    }
    setCreatingGrant(true);
    try {
      await patientService.createGrant({
        granted_to_hospital_id: grantHospitalId || undefined,
        granted_to_doctor_id: grantDoctorId || undefined,
        record_types,
        valid_days: 30,
      });
      toast.success('Access grant created (30 days)');
      setGrantOpen(false);
      setGrantHospitalId('');
      setGrantDoctorId('');
      fetchPassport();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to create grant');
    } finally {
      setCreatingGrant(false);
    }
  };

  const tabs: { key: PassportTab; label: string; icon: any }[] = [
    { key: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { key: 'reports', label: 'Reports', icon: FileText },
    { key: 'grants', label: 'Access Grants', icon: Share2 },
  ];

  return (
    <div className="p-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-light tracking-tight">Health Passport</h1>
        <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" /> Grant Access
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grant Record Access</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Hospital ID (optional)</Label>
                <Input
                  placeholder="Hospital UUID"
                  value={grantHospitalId}
                  onChange={(e) => setGrantHospitalId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Doctor ID (optional)</Label>
                <Input
                  placeholder="Doctor UUID"
                  value={grantDoctorId}
                  onChange={(e) => setGrantDoctorId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Record Types (comma-separated)</Label>
                <Input
                  value={grantRecordTypes}
                  onChange={(e) => setGrantRecordTypes(e.target.value)}
                  placeholder="prescriptions,reports"
                />
              </div>
              <Button onClick={handleCreateGrant} disabled={creatingGrant} className="w-full">
                {creatingGrant ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Grant Access (30 days)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Inner tabs */}
      <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1 mb-6 w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm rounded-md transition-colors ${
              tab === key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Prescriptions */}
          {tab === 'prescriptions' && (
            <div className="space-y-3">
              {(passport?.prescriptions ?? []).length === 0 ? (
                <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">No prescriptions found.</div>
              ) : (
                (passport?.prescriptions ?? []).map((rx) => (
                  <div key={rx.id} className="bg-card rounded-xl border p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{rx.illness_description ?? 'Prescription'}</p>
                        <p className="text-sm text-muted-foreground">
                          Issued {format(parseISO(rx.issued_at), 'MMM d, yyyy')}
                          {(rx as any).doctors ? ` · Dr. ${(rx as any).doctors.full_name}` : ''}
                        </p>
                      </div>
                    </div>
                    {(rx.prescription_items ?? []).length > 0 && (
                      <div className="border-t pt-3 space-y-1.5">
                        {(rx.prescription_items ?? []).map((item: any) => (
                          <div key={item.id} className="flex items-start justify-between text-sm">
                            <span className="font-medium">{item.medicines?.medicine_name ?? item.medicine_id}</span>
                            <span className="text-muted-foreground text-xs text-right">
                              {item.dosage} · {item.frequency} · {item.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Reports */}
          {tab === 'reports' && (
            <div className="space-y-3">
              {(passport?.reports ?? []).length === 0 ? (
                <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">No reports found.</div>
              ) : (
                (passport?.reports ?? []).map((report) => (
                  <div key={report.id} className="bg-card rounded-xl border p-5 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{report.report_name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {report.report_type.replace('_', ' ')} · {(report as any).hospitals?.name ?? ''} ·{' '}
                        {format(parseISO(report.uploaded_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <a
                      href={report.report_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View
                    </a>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Grants */}
          {tab === 'grants' && (
            <div className="space-y-3">
              {(passport?.grants ?? []).length === 0 ? (
                <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">No active grants.</div>
              ) : (
                (passport?.grants ?? []).map((grant) => (
                  <div key={grant.id} className="bg-card rounded-xl border p-5 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {(grant as any).hospitals?.name ?? (grant as any).doctors?.full_name ?? 'Unknown recipient'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Records: {grant.record_types.join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Valid until {format(parseISO(grant.valid_until), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      disabled={revoking === grant.id}
                      onClick={() => handleRevoke(grant.id)}
                    >
                      {revoking === grant.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
