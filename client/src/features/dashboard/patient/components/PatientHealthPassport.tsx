import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FileText,
  Pill,
  Share2,
  Loader2,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  Shield,
  Clock,
  UserRound,
  Building2,
  ArrowRightLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  patientService,
  type PatientPassport,
  type AccessGrant,
  type PatientReferral,
} from '@/services/patient.service';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import {
  PrescriptionViewModal,
  normalizePrescriptionData,
  type PDFPrescriptionData,
} from '@/features/dashboard/shared/PrescriptionViewModal';

type PassportTab = 'prescriptions' | 'reports' | 'grants' | 'referrals';

// ─── Helper: group grants by doctor ──────────────────────────────────────────

interface GroupedGrant {
  doctorId: string;
  doctorName: string;
  specialisation: string;
  hospitalName: string;
  grants: AccessGrant[];
}

function groupGrantsByDoctor(grants: AccessGrant[]): GroupedGrant[] {
  const map = new Map<string, GroupedGrant>();

  for (const g of grants) {
    const docId = g.granted_to_doctor_id ?? 'unknown';
    if (!map.has(docId)) {
      map.set(docId, {
        doctorId: docId,
        doctorName: g.doctor?.full_name ?? 'Unknown Doctor',
        specialisation: g.doctor?.specialisation ?? '',
        hospitalName: g.doctor?.hospitals?.name ?? '',
        grants: [],
      });
    }
    map.get(docId)!.grants.push(g);
  }

  return [...map.values()].sort((a, b) => {
    // Sort by most recent grant first
    const aLatest = Math.max(...a.grants.map(g => new Date(g.created_at).getTime()));
    const bLatest = Math.max(...b.grants.map(g => new Date(g.created_at).getTime()));
    return bLatest - aLatest;
  });
}

// ─── Main Component ──────────────────────────────────────────────────────────

export const PatientHealthPassport = () => {
  const [tab, setTab] = useState<PassportTab>('prescriptions');
  const [passport, setPassport] = useState<PatientPassport | null>(null);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingDoctor, setRevokingDoctor] = useState<string | null>(null);

  // PDF modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRxId, setSelectedRxId] = useState<string | null>(null);

  // Collapsible doctor groups
  const [expandedDoctors, setExpandedDoctors] = useState<Set<string>>(new Set());

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

  // Fetcher for the PDF modal
  const fetchPDFData = useCallback(async (id: string): Promise<PDFPrescriptionData> => {
    const res = await patientService.getPrescription(id);
    const raw = (res as any).data?.prescription;
    if (!raw) throw new Error('Prescription not found');
    return normalizePrescriptionData(raw);
  }, []);

  const openModal = (rxId: string) => {
    setSelectedRxId(rxId);
    setViewModalOpen(true);
  };

  // Revoke a single grant
  const handleRevokeSingle = async (grantId: string) => {
    setRevoking(grantId);
    try {
      await patientService.revokeGrant(grantId);
      toast.success('Access revoked');
      fetchPassport();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to revoke access');
    } finally {
      setRevoking(null);
    }
  };

  // Revoke ALL grants for a doctor
  const handleRevokeAllForDoctor = async (doctorId: string, doctorName: string) => {
    setRevokingDoctor(doctorId);
    try {
      await patientService.revokeAllGrantsForDoctor(doctorId);
      toast.success(`All access for Dr. ${doctorName} revoked`);
      fetchPassport();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to revoke access');
    } finally {
      setRevokingDoctor(null);
    }
  };

  const toggleDoctorExpanded = (doctorId: string) => {
    setExpandedDoctors(prev => {
      const next = new Set(prev);
      if (next.has(doctorId)) next.delete(doctorId);
      else next.add(doctorId);
      return next;
    });
  };

  // Grouped grants
  const groupedGrants = useMemo(
    () => groupGrantsByDoctor(passport?.grants ?? []),
    [passport?.grants]
  );

  const activeGrantCount = (passport?.grants ?? []).filter(g => g.is_active).length;
  const expiredGrantCount = (passport?.grants ?? []).filter(g => !g.is_active).length;

  const tabs: { key: PassportTab; label: string; icon: any; badge?: number }[] = [
    { key: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { key: 'reports', label: 'Reports', icon: FileText },
    { key: 'grants', label: 'Access Granted', icon: Share2, badge: activeGrantCount || undefined },
    { key: 'referrals', label: 'Referrals', icon: ArrowRightLeft },
  ];

  return (
    <>
      <div className="p-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-light tracking-tight">Health Passport</h1>
        </div>

        {/* Inner tabs */}
        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1 mb-6 w-fit flex-wrap">
          {tabs.map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm rounded-md transition-colors ${
                tab === key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {badge !== undefined && badge > 0 && (
                <span className="bg-primary/10 text-primary text-xs font-medium rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* ── Prescriptions ── */}
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openModal(rx.id)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          View PDF
                        </Button>
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

            {/* ── Reports ── */}
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

            {/* ── Access Granted ── */}
            {tab === 'grants' && (
              <div className="space-y-4">
                {/* Summary */}
                {(activeGrantCount > 0 || expiredGrantCount > 0) && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-green-500" />
                      {activeGrantCount} active
                    </span>
                    {expiredGrantCount > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground/50" />
                        {expiredGrantCount} expired
                      </span>
                    )}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Grant access to your documents when booking an appointment. You can revoke access at any time.
                </p>

                {groupedGrants.length === 0 ? (
                  <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">
                    <Share2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p>No access grants.</p>
                    <p className="text-sm mt-1">When you book an appointment, you can share specific documents with the doctor.</p>
                  </div>
                ) : (
                  groupedGrants.map((group) => {
                    const isExpanded = expandedDoctors.has(group.doctorId);
                    const activeInGroup = group.grants.filter(g => g.is_active).length;
                    const allExpired = activeInGroup === 0;

                    return (
                      <div
                        key={group.doctorId}
                        className={`bg-card rounded-xl border overflow-hidden ${
                          allExpired ? 'opacity-60' : ''
                        }`}
                      >
                        {/* Doctor header */}
                        <div
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() => toggleDoctorExpanded(group.doctorId)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserRound className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Dr. {group.doctorName}</p>
                              <p className="text-sm text-muted-foreground">
                                {group.specialisation}
                                {group.hospitalName && (
                                  <span className="inline-flex items-center gap-1 ml-2">
                                    <Building2 className="h-3 w-3" />
                                    {group.hospitalName}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              allExpired
                                ? 'bg-muted text-muted-foreground'
                                : 'bg-green-500/10 text-green-600'
                            }`}>
                              {activeInGroup} active · {group.grants.length} total
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        {/* Expanded: list of shared documents */}
                        {isExpanded && (
                          <div className="border-t">
                            <div className="divide-y">
                              {group.grants.map((grant) => {
                                const isActive = grant.is_active;
                                const docName = grant.document_type === 'prescription'
                                  ? (grant.document?.illness_description ?? 'Prescription')
                                  : (grant.document?.report_name ?? 'Report');
                                const docDate = grant.document_type === 'prescription'
                                  ? grant.document?.issued_at
                                  : grant.document?.uploaded_at;
                                const docAuthor = grant.document_type === 'prescription'
                                  ? grant.document?.doctors?.full_name
                                  : null;

                                return (
                                  <div key={grant.id} className="flex items-center justify-between px-4 py-3">
                                    <div className="flex items-center gap-3">
                                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                                        grant.document_type === 'prescription'
                                          ? 'bg-blue-500/10'
                                          : 'bg-amber-500/10'
                                      }`}>
                                        {grant.document_type === 'prescription' ? (
                                          <Pill className="h-4 w-4 text-blue-500" />
                                        ) : (
                                          <FileText className="h-4 w-4 text-amber-500" />
                                        )}
                                      </div>
                                      <div>
                                        <p className={`text-sm font-medium ${!isActive ? 'line-through text-muted-foreground' : ''}`}>
                                          {docName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {grant.document_type === 'prescription' ? 'Prescription' : 'Report'}
                                          {docDate && ` · ${format(parseISO(docDate), 'MMM d, yyyy')}`}
                                          {docAuthor && ` · Dr. ${docAuthor}`}
                                          {grant.source !== 'manual' && (
                                            <span className="ml-1 text-xs bg-muted rounded px-1 py-0.5 capitalize">
                                              {grant.source}
                                            </span>
                                          )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {isActive
                                            ? `Expires ${format(parseISO(grant.valid_until), 'MMM d, yyyy')}`
                                            : 'Expired'}
                                        </p>
                                      </div>
                                    </div>
                                    {isActive && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive shrink-0"
                                        disabled={revoking === grant.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRevokeSingle(grant.id);
                                        }}
                                      >
                                        {revoking === grant.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4" />
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Revoke all for this doctor */}
                            {activeInGroup > 1 && (
                              <div className="border-t px-4 py-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive border-destructive/30 hover:bg-destructive/10 w-full"
                                  disabled={revokingDoctor === group.doctorId}
                                  onClick={() => handleRevokeAllForDoctor(group.doctorId, group.doctorName)}
                                >
                                  {revokingDoctor === group.doctorId ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <Trash2 className="h-4 w-4 mr-2" />
                                  )}
                                  Revoke All Access for Dr. {group.doctorName}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── Referrals ── */}
            {tab === 'referrals' && (
              <div className="space-y-3">
                {(passport?.referrals ?? []).length === 0 ? (
                  <div className="bg-card rounded-xl border p-12 text-center text-muted-foreground">
                    <ArrowRightLeft className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p>No referrals.</p>
                    <p className="text-sm mt-1">When a doctor refers you to another doctor, it will appear here.</p>
                  </div>
                ) : (
                  (passport?.referrals ?? []).map((referral: PatientReferral) => {
                    const statusColor = {
                      pending: 'bg-yellow-500/10 text-yellow-600',
                      accepted: 'bg-green-500/10 text-green-600',
                      declined: 'bg-red-500/10 text-red-600',
                      completed: 'bg-blue-500/10 text-blue-600',
                    }[referral.status] ?? 'bg-muted text-muted-foreground';

                    return (
                      <div key={referral.id} className="bg-card rounded-xl border p-5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium text-sm">
                              Dr. {referral.referring_doctor?.full_name ?? 'Unknown'}
                              <span className="text-muted-foreground font-normal mx-2">referred you to</span>
                              Dr. {referral.referred_to_doctor?.full_name ?? 'Unknown'}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColor}`}>
                            {referral.status}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-0.5">
                          {referral.referring_doctor?.specialisation && (
                            <p>
                              From: {referral.referring_doctor.specialisation}
                              {referral.referring_doctor.hospitals?.name && ` at ${referral.referring_doctor.hospitals.name}`}
                            </p>
                          )}
                          {referral.referred_to_doctor?.specialisation && (
                            <p>
                              To: {referral.referred_to_doctor.specialisation}
                              {referral.referred_to_doctor.hospitals?.name && ` at ${referral.referred_to_doctor.hospitals.name}`}
                            </p>
                          )}
                          {referral.reason && (
                            <p className="italic">Reason: {referral.reason}</p>
                          )}
                          <p className="text-xs">
                            {format(parseISO(referral.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>

      {selectedRxId && (
        <PrescriptionViewModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          prescriptionId={selectedRxId}
          label="Prescription Preview"
          fetchData={fetchPDFData}
        />
      )}
    </>
  );
};
