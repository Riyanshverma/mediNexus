import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { LuTrash2, LuPlus } from 'react-icons/lu';
import { RiMedicineBottleLine } from 'react-icons/ri';

interface PrescribedMedicine {
  id: string; // unique ID for this prescription line
  medicineId: string;
  name: string;
  type: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface DroppablePrescriptionSlotProps {
  medicines: PrescribedMedicine[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof PrescribedMedicine, value: string) => void;
}

export const DroppablePrescriptionSlot: React.FC<DroppablePrescriptionSlotProps> = ({ 
  medicines, 
  onRemove, 
  onUpdate 
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'prescription-slot',
  });

  return (
    <div 
      ref={setNodeRef} 
      className={`h-full min-h-[400px] p-6 rounded-xl border-2 transition-colors ${
        isOver ? 'border-primary bg-primary/5 border-dashed' : 'border-border bg-card'
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="bg-primary/10 text-primary p-1.5 rounded-lg">
              <RiMedicineBottleLine size={20} />
            </span>
            Current Prescription
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop medicines here to prescribe.
          </p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20">
          {medicines.length} items
        </Badge>
      </div>

      <div className="space-y-4">
        {medicines.length === 0 ? (
          <div className="h-48 border-2 border-dashed border-muted-foreground/20 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
            <LuPlus size={32} className="mb-2 opacity-30" />
            <p className="text-sm font-medium">Drop medicine here</p>
          </div>
        ) : (
          medicines.map((med) => (
            <Card key={med.id} className="overflow-hidden border-primary/20 shadow-sm">
              <div className="bg-muted/40 px-4 py-2 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{med.name}</span>
                  <Badge variant="outline" className="text-[10px] uppercase font-normal">{med.type}</Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => onRemove(med.id)}
                >
                  <LuTrash2 size={16} />
                </Button>
              </div>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Dosage (e.g. 500mg)</Label>
                    <Input 
                      className="h-9 text-sm" 
                      value={med.dosage} 
                      onChange={(e) => onUpdate(med.id, 'dosage', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Frequency (e.g. 1-0-1)</Label>
                    <Input 
                      className="h-9 text-sm" 
                      value={med.frequency} 
                      onChange={(e) => onUpdate(med.id, 'frequency', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Duration (e.g. 5 days)</Label>
                    <Input 
                      className="h-9 text-sm" 
                      value={med.duration} 
                      onChange={(e) => onUpdate(med.id, 'duration', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-4">
                    <Label className="text-xs text-muted-foreground">Special Instructions</Label>
                    <Input 
                      className="h-9 text-sm bg-amber-50/30 border-amber-200 focus-visible:ring-amber-400" 
                      placeholder="e.g. Take after meals, with a glass of water."
                      value={med.instructions} 
                      onChange={(e) => onUpdate(med.id, 'instructions', e.target.value)} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
