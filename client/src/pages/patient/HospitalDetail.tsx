import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { Hospital } from '../../types/hospital';
import type { Doctor } from '../../types/doctor';
import { DoctorCard } from '../../components/patient/DoctorCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { ROUTES } from '../../lib/constants';
import { LuMapPin, LuPhone, LuMail } from 'react-icons/lu';

export const HospitalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: hospital, isLoading: loadingHospital } = useQuery<Hospital>({
    queryKey: ['hospital', id],
    queryFn: async () => {
      // Mock API call
      return new Promise<Hospital>((resolve) => {
        setTimeout(() => {
          resolve({
            id: id!,
            name: 'City Care Hospital',
            address: { street: '123 Health Ave', city: 'Metropolis', state: 'NY', zipCode: '10001' },
            phone: '555-0199',
            email: 'contact@citycare.com',
            rating: 4.5,
            services: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics'],
          });
        }, 800);
      });
    }
  });

  const { data: doctors, isLoading: loadingDoctors } = useQuery<Doctor[]>({
    queryKey: ['hospital-doctors', id],
    queryFn: async () => {
      return new Promise<Doctor[]>((resolve) => {
        setTimeout(() => {
          resolve([
            { id: 'd1', hospitalId: id!, name: 'Dr. Sarah Smith', specialty: 'General Physician', qualification: 'MBBS, MD', experienceYears: 10, consultationFee: 50, rating: 4.8 },
            { id: 'd2', hospitalId: id!, name: 'Dr. John Doe', specialty: 'Cardiologist', qualification: 'MD, DM', experienceYears: 12, consultationFee: 100, rating: 4.9 },
          ]);
        }, 800);
      });
    }
  });

  if (loadingHospital) {
    return <div className="p-8 text-center animate-pulse">Loading hospital details...</div>;
  }

  if (!hospital) {
    return <div className="p-8 text-center text-destructive">Hospital not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 relative rounded-2xl overflow-hidden bg-muted h-64 shadow-md">
        {hospital.imageUrl ? (
          <img src={hospital.imageUrl} alt={hospital.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
            <span className="font-bold text-5xl opacity-50">{hospital.name.charAt(0)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <Badge className="mb-3 bg-primary text-primary-foreground border-none">
            {hospital.rating.toFixed(1)} Rating
          </Badge>
          <h1 className="text-4xl font-bold mb-2">{hospital.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
            <span className="flex items-center gap-1.5"><LuMapPin size={16}/> {hospital.address.city}, {hospital.address.state}</span>
            <span className="flex items-center gap-1.5"><LuPhone size={16}/> {hospital.phone}</span>
            <span className="flex items-center gap-1.5"><LuMail size={16}/> {hospital.email}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="doctors" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8 relative">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="doctors">Available Doctors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="bg-card border rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">About {hospital.name}</h3>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Welcome to {hospital.name}, a premier healthcare facility dedicated to providing top-quality medical services and compassionate care to our community. Our state-of-the-art infrastructure and highly experienced medical professionals ensure you receive the best treatment possible.
            </p>
            
            <h4 className="text-lg font-bold mb-4">Available Services</h4>
            <div className="flex flex-wrap gap-2">
              {hospital.services.map((service, idx) => (
                <Badge key={idx} variant="secondary" className="px-3 py-1.5 text-sm font-normal">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="doctors" className="space-y-6">
          {loadingDoctors ? (
            <div className="text-center py-12 text-muted-foreground animate-pulse">Loading doctors...</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {doctors?.map(doctor => (
                <DoctorCard 
                  key={doctor.id} 
                  doctor={doctor} 
                  onBook={() => navigate(ROUTES.PATIENT.BOOK_SLOT(doctor.id))}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
