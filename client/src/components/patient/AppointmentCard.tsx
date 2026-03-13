import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import type { Appointment } from '../../types/appointment';
import type { Doctor } from '../../types/doctor';
import type { Hospital } from '../../types/hospital';
import { formatTime, formatDate } from '../../lib/date';
import { 
  LuCalendar, 
  LuClock, 
  LuMapPin, 
  LuVideo, 
  LuCircleCheck,
  LuX
} from 'react-icons/lu';

interface AppointmentCardProps {
  appointment: Appointment;
  doctor: Doctor;
  hospital: Hospital;
  onCancel?: (id: string) => void;
  onReschedule?: (id: string) => void;
  onJoinSession?: (id: string) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  doctor, 
  hospital,
  onCancel,
  onReschedule,
  onJoinSession
}) => {
  const isUpcoming = appointment.status === 'scheduled';
  
  return (
    <Card className={`overflow-hidden transition-all ${isUpcoming ? 'border-primary/20 shadow-sm' : 'opacity-80'}`}>
      <div className={`px-4 py-2 flex justify-between items-center border-b ${
        appointment.status === 'scheduled' ? 'bg-primary/5 text-primary' : 
        appointment.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 
        appointment.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
        'bg-blue-50 text-blue-700'
      }`}>
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-4">
            <LuCalendar size={14} className="shrink-0" />
            <span className="truncate">{formatDate(appointment.date, 'EEEE, MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <LuClock size={14} />
            <span>{formatTime(appointment.date)}</span>
          </div>
        </div>
        <Badge variant={
          appointment.status === 'scheduled' ? 'default' : 
          appointment.status === 'completed' ? 'secondary' : 'outline'
        } className={`ml-2 shrink-0 ${
          appointment.status === 'completed' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' :
          appointment.status === 'cancelled' ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' : ''
        }`}>
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace('_', ' ')}
        </Badge>
      </div>

      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start sm:items-center">
          <Avatar className="h-16 w-16 border bg-muted shrink-0">
            <AvatarImage src={doctor.avatarUrl} alt={doctor.name} />
            <AvatarFallback>{doctor.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-lg truncate pr-4">{doctor.name}</h4>
            <p className="text-primary text-sm font-medium mb-1">{doctor.specialty}</p>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground w-full">
              <LuMapPin size={14} className="shrink-0" />
              <span className="truncate">{hospital.name}, {hospital.address.city}</span>
            </div>
          </div>
        </div>

        {appointment.symptoms && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm mb-4">
            <span className="font-semibold block mb-1">Reason for visit:</span>
            <p className="text-muted-foreground">{appointment.symptoms}</p>
          </div>
        )}

        {isUpcoming && (
          <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t">
            {onJoinSession && (
              <Button onClick={() => onJoinSession(appointment.id)} className="w-full sm:flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                <LuVideo className="mr-2 h-4 w-4" />
                Join Video Call
              </Button>
            )}
            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              {onReschedule && (
                <Button variant="outline" onClick={() => onReschedule(appointment.id)} className="flex-1 sm:w-auto">
                  Reschedule
                </Button>
              )}
              {onCancel && (
                <Button variant="outline" onClick={() => onCancel(appointment.id)} className="flex-none text-destructive hover:text-destructive hover:bg-destructive/10">
                  <LuX className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
        
        {appointment.status === 'completed' && (
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full opacity-50 cursor-not-allowed">
              <LuCircleCheck className="mr-2 h-4 w-4" />
              Prescription Available
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
