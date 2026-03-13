import React from 'react';
import { Switch } from '../ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import type { Doctor } from '../../types/doctor';

interface AccessGrantRowProps {
  doctor: Partial<Doctor>;
  hasAccess: boolean;
  onToggle: (doctorId: string, access: boolean) => void;
  hospitalName?: string;
}

export const AccessGrantRow: React.FC<AccessGrantRowProps> = ({ 
  doctor, 
  hasAccess, 
  onToggle,
  hospitalName 
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border bg-muted shrink-0">
          <AvatarImage src={doctor.avatarUrl} alt={doctor.name} />
          <AvatarFallback>{doctor.name?.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium text-sm">{doctor.name}</h4>
          <p className="text-xs text-muted-foreground">
            {doctor.specialty} {hospitalName ? `• ${hospitalName}` : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-muted-foreground hidden sm:inline-block">
          {hasAccess ? 'Access Granted' : 'Revoked'}
        </span>
        <Switch 
          checked={hasAccess} 
          onCheckedChange={(checked) => onToggle(doctor.id!, checked)}
        />
      </div>
    </div>
  );
};
