import React, { useState } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { MedicineSearchPanel } from './MedicineSearchPanel';
import { DroppablePrescriptionSlot } from './DroppablePrescriptionSlot';
import { Button } from '../ui/button';
import { LuSave } from 'react-icons/lu';
import toast from 'react-hot-toast';

interface PrescribedMedicine {
  id: string;
  medicineId: string;
  name: string;
  type: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export const PrescriptionBuilder: React.FC = () => {
  const [prescribed, setPrescribed] = useState<PrescribedMedicine[]>([]);
  
  // Setup sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px drag distance to activate
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    
    // Check if dragged over the prescription slot
    if (over && over.id === 'prescription-slot') {
      const medicineData = active.data.current as any;
      
      if (!medicineData) return;
      
      // Prevent duplicates by checking medicineId
      if (prescribed.some(m => m.medicineId === medicineData.id)) {
        toast.error(`${medicineData.name} is already in the prescription`);
        return;
      }

      const newItem: PrescribedMedicine = {
        id: crypto.randomUUID(),
        medicineId: medicineData.id,
        name: medicineData.name,
        type: medicineData.type,
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      };
      
      setPrescribed(prev => [...prev, newItem]);
    }
  };

  const handleRemove = (id: string) => {
    setPrescribed(prev => prev.filter(m => m.id !== id));
  };

  const handleUpdate = (id: string, field: keyof PrescribedMedicine, value: string) => {
    setPrescribed(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSave = () => {
    if (prescribed.length === 0) {
      toast.error('Add at least one medicine to save');
      return;
    }
    
    // Validate empty required fields if needed
    toast.success('Prescription saved successfully');
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-xl border overflow-hidden shadow-sm">
      <div className="p-4 border-b bg-muted/40 flex justify-between items-center">
        <h2 className="font-bold text-lg">Digital e-Prescription</h2>
        <Button onClick={handleSave} className="gap-2">
          <LuSave size={16} /> Save & Issue
        </Button>
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden min-h-[600px]">
        {/* Wrap context provider over Draggable source and Droppable target */}
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="border-r md:col-span-1 overflow-auto bg-background/50 h-full">
            <MedicineSearchPanel />
          </div>
          
          <div className="md:col-span-2 p-6 overflow-auto bg-muted/10 h-full">
            <DroppablePrescriptionSlot 
              medicines={prescribed} 
              onRemove={handleRemove} 
              onUpdate={handleUpdate} 
            />
          </div>
        </DndContext>
      </div>
    </div>
  );
};
