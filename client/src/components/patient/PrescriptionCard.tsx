import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { Prescription } from '../../types/prescription';
import { formatDate } from '../../lib/date';
import { RiMedicineBottleLine } from 'react-icons/ri';
import { LuFileDown } from 'react-icons/lu';

interface PrescriptionCardProps {
  prescription: Prescription;
  doctorName: string;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ prescription, doctorName }) => {
  return (
    <Card className="overflow-hidden hover:shadow-sm transition-all h-full flex flex-col">
      <CardHeader className="bg-primary/5 pb-4 border-b">
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 mb-1">
              <RiMedicineBottleLine className="text-primary" />
              Prescription
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              By {doctorName} • {formatDate(prescription.date)}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 text-primary" title="Download PDF">
            <LuFileDown size={20} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="mb-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Diagnosis</span>
          <p className="font-medium">{prescription.diagnosis}</p>
        </div>
        
        <div className="space-y-3 flex-1 overflow-auto max-h-[300px] mb-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Medicines</span>
          {prescription.medicines.map((med, idx) => (
            <div key={idx} className="bg-muted/30 rounded-lg p-3 border border-border/50">
              <div className="flex justify-between items-start gap-2 mb-1">
                <p className="font-semibold text-sm truncate">{med.name}</p>
                <Badge variant="outline" className="text-xs shrink-0">{med.duration}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{med.dosage} • {med.frequency}</p>
              {med.instructions && (
                <p className="text-xs italic text-muted-foreground bg-amber-50 rounded px-2 py-1 mt-2 w-full truncate border border-amber-100/50">
                  {med.instructions}
                </p>
              )}
            </div>
          ))}
        </div>
        
        <Button variant="outline" className="w-full mt-auto">
          Order Medicines
        </Button>
      </CardContent>
    </Card>
  );
};
