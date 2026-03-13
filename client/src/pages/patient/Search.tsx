import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader';
import { HospitalCard } from '../../components/patient/HospitalCard';
import { DoctorCard } from '../../components/patient/DoctorCard';
import { EmptyState } from '../../components/shared/EmptyState';
import { ROUTES } from '../../lib/constants';
import { LuSearch, LuFilter } from 'react-icons/lu';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { useQuery } from '@tanstack/react-query';
import type { Hospital } from '../../types/hospital';
import type { Doctor } from '../../types/doctor';
import { useDebounce } from '../../hooks/useDebounce';
import { SkeletonCard } from '../../components/shared/SkeletonCard';
import { Button } from '../../components/ui/button';

export const Search: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'hospitals' | 'doctors'>('hospitals');
  
  const debouncedQuery = useDebounce(query, 500);

  const { data: hospitals, isLoading: loadingHospitals } = useQuery<Hospital[]>({
    queryKey: ['hospitals', debouncedQuery],
    queryFn: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            { id: '1', name: 'City General Hospital', address: { street: '', city: 'New York', state: 'NY', zipCode: '' }, phone: '', email: '', rating: 4.8, services: ['Cardiology', 'Neurology', 'Orthopedics'] },
            { id: '2', name: 'Metro Health Center', address: { street: '', city: 'San Francisco', state: 'CA', zipCode: '' }, phone: '', email: '', rating: 4.5, services: ['General', 'Pediatrics'] },
          ]);
        }, 800);
      });
    },
    enabled: searchType === 'hospitals'
  });

  const { data: doctors, isLoading: loadingDoctors } = useQuery<Doctor[]>({
    queryKey: ['doctors', debouncedQuery],
    queryFn: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            { id: 'd1', hospitalId: '1', name: 'Dr. Jane Smith', specialty: 'Cardiologist', qualification: 'MD', experienceYears: 15, consultationFee: 150, rating: 4.9 },
            { id: 'd2', hospitalId: '1', name: 'Dr. John Doe', specialty: 'Neurologist', qualification: 'MD, PhD', experienceYears: 10, consultationFee: 120, rating: 4.7 },
          ]);
        }, 800);
      });
    },
    enabled: searchType === 'doctors'
  });

  const isLoading = searchType === 'hospitals' ? loadingHospitals : loadingDoctors;
  const hasResults = searchType === 'hospitals' ? !!(hospitals && hospitals.length) : !!(doctors && doctors.length);

  return (
    <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Find Care" 
        description="Search for the best hospitals and specialists near you."
      />

      <div className="bg-card border shadow-sm rounded-xl p-4 mb-8 sticky top-20 z-10 transition-shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder={`Search ${searchType}...`}
              className="pl-10 h-12 text-base border-border"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 px-2 md:px-0">
            <div className="flex items-center space-x-2">
              <Label htmlFor="search-type" className="font-medium">
                {searchType === 'hospitals' ? 'Hospitals' : 'Doctors'}
              </Label>
              <Switch 
                id="search-type" 
                checked={searchType === 'doctors'}
                onCheckedChange={(c) => setSearchType(c ? 'doctors' : 'hospitals')}
              />
            </div>
            <div className="w-px h-8 bg-border hidden md:block"></div>
            <Button variant="outline" size="icon" className="h-12 w-12 shrink-0">
              <LuFilter size={18} />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6 min-h-[400px]">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : hasResults ? (
          <div className="grid gap-6 md:grid-cols-2">
            {searchType === 'hospitals' 
              ? hospitals!.map(h => (
                  <HospitalCard 
                    key={h.id} 
                    hospital={h} 
                    onViewDetails={() => navigate(ROUTES.PATIENT.HOSPITAL_DETAIL(h.id))} 
                  />
                ))
              : doctors!.map(d => (
                  <DoctorCard 
                    key={d.id} 
                    doctor={d} 
                    onBook={() => navigate(ROUTES.PATIENT.BOOK_SLOT(d.id))} 
                  />
                ))
            }
          </div>
        ) : (
          <EmptyState 
            icon={<LuSearch size={32} />}
            title={`No ${searchType} found`}
            description={`We couldn't find any ${searchType} matching "${query}". Try adjusting your filters or search term.`}
            actionText="Clear Search"
            onAction={() => setQuery('')}
          />
        )}
      </div>
    </div>
  );
};

// Alias export for router compatibility
export const PatientSearch = Search;
