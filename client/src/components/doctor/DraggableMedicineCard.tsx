import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { RiMedicineBottleLine } from 'react-icons/ri';

interface DraggableMedicineCardProps {
  id: string;
  medicine: {
    name: string;
    type: string;
    description: string;
  };
}

export const DraggableMedicineCard: React.FC<DraggableMedicineCardProps> = ({ id, medicine }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: medicine
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className={`touch-none cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 scale-95' : ''}`}
    >
      <Card className={`hover:border-primary/50 transition-colors ${isDragging ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''}`}>
        <CardContent className="p-3 flex items-start gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-md shrink-0">
            <RiMedicineBottleLine size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-semibold text-sm truncate pr-2">{medicine.name}</h4>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0 font-normal">
                {medicine.type}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{medicine.description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
