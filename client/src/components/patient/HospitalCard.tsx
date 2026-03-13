import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { LuMapPin, LuStar } from 'react-icons/lu';
import type { Hospital } from '../../types/hospital';

interface HospitalCardProps {
  hospital: Hospital;
  onViewDetails: (id: string) => void;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({ hospital, onViewDetails }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all group">
      <div className="h-48 bg-muted relative">
        {hospital.imageUrl ? (
          <img src={hospital.imageUrl} alt={hospital.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
            <span className="font-bold text-lg">{hospital.name.charAt(0)}</span>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-sm font-medium">
          <LuStar className="text-amber-500 fill-amber-500" size={14} />
          {hospital.rating.toFixed(1)}
        </div>
      </div>
      <CardContent className="p-5">
        <h3 className="font-bold text-lg mb-1 truncate">{hospital.name}</h3>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-4">
          <LuMapPin size={14} className="shrink-0" />
          <span className="truncate">{hospital.address.city}, {hospital.address.state}</span>
        </p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {hospital.services.slice(0, 3).map((service, idx) => (
            <Badge key={idx} variant="secondary" className="font-normal text-xs">
              {service}
            </Badge>
          ))}
          {hospital.services.length > 3 && (
            <Badge variant="outline" className="font-normal text-xs text-muted-foreground">
              +{hospital.services.length - 3} more
            </Badge>
          )}
        </div>
        
        <Button 
          className="w-full" 
          onClick={() => onViewDetails(hospital.id)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};
