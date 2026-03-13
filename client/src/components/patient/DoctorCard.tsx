import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { LuStar, LuBriefcase } from 'react-icons/lu';
import type { Doctor } from '../../types/doctor';

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (id: string) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBook }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <Avatar className="h-20 w-20 border-2 border-primary/20 shrink-0">
            <AvatarImage src={doctor.avatarUrl} alt={doctor.name} />
            <AvatarFallback className="text-xl bg-primary/10 text-primary">
              {doctor.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2 mb-1">
              <h3 className="font-bold text-lg truncate">{doctor.name}</h3>
              <div className="flex items-center gap-1 text-sm font-medium bg-amber-50 text-amber-900 px-2 py-0.5 rounded-full shrink-0">
                <LuStar className="text-amber-500 fill-amber-500" size={14} />
                {doctor.rating.toFixed(1)}
              </div>
            </div>
            
            <p className="text-primary font-medium text-sm mb-2">{doctor.specialty}</p>
            
            <div className="space-y-1.5 mb-4">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <LuBriefcase size={14} className="shrink-0" />
                {doctor.experienceYears} years experience
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {doctor.qualification}
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="font-semibold text-lg">
                ${doctor.consultationFee} 
                <span className="text-sm font-normal text-muted-foreground">/visit</span>
              </div>
              <Button onClick={() => onBook(doctor.id)}>
                Book Slot
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
