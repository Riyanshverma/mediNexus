import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import type { Appointment } from '../../types/appointment';
import type { Patient } from '../../types/patient';
import { formatTime } from '../../lib/date';
import { LuClock, LuActivity, LuVideo, LuPlay } from 'react-icons/lu';

interface QueueCardProps {
  appointment: Appointment;
  patient: Patient;
  isActive?: boolean;
  onStartConsultation?: (id: string) => void;
  onViewPassport?: (patientId: string) => void;
}

export const QueueCard: React.FC<QueueCardProps> = ({ 
  appointment, 
  patient,
  isActive = false,
  onStartConsultation,
  onViewPassport
}) => {
  const isWaiting = appointment.status === 'scheduled';
  
  return (
    <Card className={`overflow-hidden transition-all ${isActive ? 'border-primary ring-1 ring-primary/20 shadow-md' : 'hover:shadow-sm'}`}>
      <div className={`px-4 py-2 flex justify-between items-center border-b ${
        isActive ? 'bg-primary/10 text-primary' : 'bg-muted/50'
      }`}>
        <div className="flex items-center gap-2 text-sm font-medium">
          <LuClock size={14} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
          <span>{formatTime(appointment.date)}</span>
        </div>
        <Badge variant={isActive ? 'default' : 'outline'} className={isActive ? 'animate-pulse' : ''}>
          {isActive ? 'In Progress' : 'Waiting'}
        </Badge>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-12 w-12 border bg-muted shrink-0">
            <AvatarImage src={patient.avatarUrl} alt={patient.name} />
            <AvatarFallback>{patient.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-base truncate">{patient.name}</h4>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span>{patient.gender === 'male' ? 'M' : patient.gender === 'female' ? 'F' : 'O'}</span>
              <span>•</span>
              <span>Blood: {patient.bloodGroup || 'Unknown'}</span>
            </p>
          </div>
        </div>

        {appointment.symptoms && (
          <div className="bg-muted/30 rounded-lg p-2.5 text-xs mb-4 line-clamp-2 text-muted-foreground border border-border/50">
            <span className="font-medium text-foreground mr-1">Symptoms:</span>
            {appointment.symptoms}
          </div>
        )}

        <div className="flex gap-2 mt-2">
          {onViewPassport && (
            <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => onViewPassport(patient.id)}>
              <LuActivity className="mr-1.5 h-3.5 w-3.5" />
              Passport
            </Button>
          )}
          
          {onStartConsultation && isWaiting && !isActive && (
            <Button size="sm" className="flex-1 text-xs h-8" onClick={() => onStartConsultation(appointment.id)}>
              <LuPlay className="mr-1.5 h-3.5 w-3.5" />
              Start
            </Button>
          )}
          
          {isActive && (
            <Button size="sm" className="flex-1 text-xs h-8 bg-emerald-600 hover:bg-emerald-700">
              <LuVideo className="mr-1.5 h-3.5 w-3.5" />
              Join Call
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
