import React, { useState } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { PrescriptionCard } from '../../components/patient/PrescriptionCard';
import { ReportCard } from '../../components/patient/ReportCard';
import { AccessGrantRow } from '../../components/patient/AccessGrantRow';
import { LuShield, LuKey } from 'react-icons/lu';
import { Button } from '../../components/ui/button';

export const HealthPassport: React.FC = () => {
  const [accessMap, setAccessMap] = useState<Record<string, boolean>>({
    'd1': true,
    'd2': false
  });

  const handleToggleAccess = (doctorId: string, access: boolean) => {
    setAccessMap(prev => ({ ...prev, [doctorId]: access }));
  };

  const mockPrescriptions = [
    {
      id: 'p1',
      patientId: 'pat1',
      doctorId: 'd1',
      date: new Date().toISOString(),
      medicines: [
        { id: 'm1', name: 'Amoxicillin', dosage: '500mg', frequency: 'Twice a day', duration: '5 days', instructions: 'Take after meals' },
        { id: 'm2', name: 'Paracetamol', dosage: '650mg', frequency: 'As needed', duration: '3 days' }
      ],
      diagnosis: 'Viral Fever with throat infection'
    }
  ];

  const mockReports = [
    { id: '1', title: 'Complete Blood Count (CBC)', date: new Date().toISOString(), source: 'City Lab', type: 'Blood Test' },
    { id: '2', title: 'Chest X-Ray', date: new Date(Date.now() - 86400000 * 30).toISOString(), source: 'Metro Health Diagnostics', type: 'Imaging' },
  ];

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <PageHeader 
          title="Health Passport" 
          description="Your centralized, secure medical history."
        />
        <Button variant="outline" className="shrink-0 bg-primary/5 border-primary/20 text-primary">
          <LuShield className="mr-2 h-4 w-4" />
          Data is End-to-End Encrypted
        </Button>
      </div>

      <Tabs defaultValue="prescriptions" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px] mb-8">
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="reports">Lab Reports</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
        </TabsList>
        
        <TabsContent value="prescriptions" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPrescriptions.map(p => (
              <PrescriptionCard key={p.id} prescription={p} doctorName="Dr. Sarah Smith" />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Recent Reports</h3>
            <Button variant="outline" size="sm">Upload Report</Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {mockReports.map(r => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="access">
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="p-4 bg-muted/30 border-b flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <LuKey size={20} />
              </div>
              <div>
                <h3 className="font-semibold">Doctor Access Limits</h3>
                <p className="text-sm text-muted-foreground">Control who can view your medical history</p>
              </div>
            </div>
            
            <div className="divide-y">
              <AccessGrantRow 
                doctor={{ id: 'd1', name: 'Dr. Sarah Smith', specialty: 'General Physician', avatarUrl: '' }} 
                hasAccess={accessMap['d1']} 
                onToggle={handleToggleAccess}
                hospitalName="City Care Hospital"
              />
              <AccessGrantRow 
                doctor={{ id: 'd2', name: 'Dr. John Doe', specialty: 'Cardiologist', avatarUrl: '' }} 
                hasAccess={accessMap['d2']} 
                onToggle={handleToggleAccess}
                hospitalName="Metro Health Center"
              />
            </div>
            
            <div className="p-4 bg-muted/10 text-xs text-muted-foreground text-center">
              Changes to access permissions are applied instantly across the platform.
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
