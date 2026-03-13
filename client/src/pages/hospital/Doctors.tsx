import React, { useState } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { DoctorRosterTable } from '../../components/hospital/DoctorRosterTable';
import { InviteDoctorSheet } from '../../components/hospital/InviteDoctorSheet';
import { Input } from '../../components/ui/input';
import { LuSearch, LuListFilter } from 'react-icons/lu';
import { Button } from '../../components/ui/button';
import type { Doctor } from '../../types/doctor';
import toast from 'react-hot-toast';

export const HospitalDoctors: React.FC = () => {
  const [query, setQuery] = useState('');
  
  // Mock data
  const [doctors, setDoctors] = useState<Doctor[]>([
    { id: 'd1', hospitalId: 'h1', name: 'Dr. Sarah Smith', specialty: 'General Physician', qualification: 'MBBS, MD', experienceYears: 10, consultationFee: 50, rating: 4.8 },
    { id: 'd2', hospitalId: 'h1', name: 'Dr. John Doe', specialty: 'Cardiologist', qualification: 'MD, DM', experienceYears: 15, consultationFee: 150, rating: 4.9 },
    { id: 'd3', hospitalId: 'h1', name: 'Dr. Emily Chen', specialty: 'Neurologist', qualification: 'MD, PhD', experienceYears: 8, consultationFee: 120, rating: 4.7 },
  ]);

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(query.toLowerCase()) || 
    d.specialty.toLowerCase().includes(query.toLowerCase())
  );

  const handleDelete = (id: string) => {
    // Logic to ask for confirmation would go here. Mocking simple delete:
    setDoctors(prev => prev.filter(d => d.id !== id));
    toast.success('Doctor removed from roster');
  };

  const handleEdit = (_id: string) => {
    toast('Editing functionality not part of MVP mock', { icon: 'ℹ️' });
  };

  return (
    <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <PageHeader 
          title="Doctor Roster" 
          description="Manage the healthcare professionals at your facility."
        />
        <InviteDoctorSheet />
      </div>

      <div className="bg-card border shadow-sm rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Search doctors by name or specialty..."
              className="pl-10 text-base"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="shrink-0">
            <LuListFilter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <DoctorRosterTable 
        doctors={filteredDoctors} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
    </div>
  );
};
