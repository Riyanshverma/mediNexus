import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { PrescriptionCard } from '../../components/patient/PrescriptionCard';
import { ReportCard } from '../../components/patient/ReportCard';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { LuArrowLeft } from 'react-icons/lu';

export const PatientPassportView: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  // Mock patient data
  const patient = {
    id: patientId || 'p1',
    name: 'Alice Smith',
    gender: 'female',
    bloodGroup: 'A+',
    dob: '1995-05-15',
    email: 'alice@example.com',
    phone: '555-0123'
  };

  const mockPrescriptions = [
    {
      id: 'p1',
      patientId: patient.id,
      doctorId: 'd2',
      date: new Date(Date.now() - 86400000 * 15).toISOString(),
      medicines: [
        { id: 'm1', name: 'Cetirizine', dosage: '10mg', frequency: 'Once a day', duration: '5 days', instructions: 'Take at night' },
      ],
      diagnosis: 'Seasonal Allergies'
    }
  ];

  const mockReports = [
    { id: '1', title: 'Complete Blood Count (CBC)', date: new Date(Date.now() - 86400000 * 30).toISOString(), source: 'City Lab', type: 'Blood Test' },
  ];

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <LuArrowLeft size={20} />
        </Button>
        <PageHeader 
          title={`${patient.name}'s Health Passport`} 
          description="View medical history, prescriptions, and lab reports."
        />
      </div>

      <div className="bg-card border rounded-xl p-6 mb-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <Avatar className="h-24 w-24 border-4 border-primary/10">
          <AvatarImage src="" alt={patient.name} />
          <AvatarFallback className="text-2xl bg-primary/5 text-primary">
            {patient.name.split(' ').map(n=>n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Gender</p>
            <p className="font-semibold capitalize">{patient.gender}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Blood Type</p>
            <p className="font-semibold text-red-500">{patient.bloodGroup}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Age</p>
            <p className="font-semibold">
              {Math.floor((new Date().getTime() - new Date(patient.dob).getTime()) / 31557600000)} Years
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Contact</p>
            <p className="font-semibold break-all">{patient.phone}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="prescriptions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8">
          <TabsTrigger value="prescriptions">Past Prescriptions</TabsTrigger>
          <TabsTrigger value="reports">Lab Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="prescriptions" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPrescriptions.length > 0 ? mockPrescriptions.map(p => (
              <PrescriptionCard key={p.id} prescription={p} doctorName="Dr. John Doe" />
            )) : (
              <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                No past prescriptions found.
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {mockReports.length > 0 ? mockReports.map(r => (
              <ReportCard key={r.id} report={r} />
            )) : (
              <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                No lab reports uploaded.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
