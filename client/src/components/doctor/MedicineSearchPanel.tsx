import React, { useState } from 'react';
import { Input } from '../ui/input';
import { LuSearch, LuListFilter } from 'react-icons/lu';
import { DraggableMedicineCard } from './DraggableMedicineCard';
import { ScrollArea } from '../ui/scroll-area';

const MOCK_MEDICINES = [
  { id: 'm1', name: 'Amoxicillin', type: 'Antibiotic', description: 'Treats bacterial infections' },
  { id: 'm2', name: 'Paracetamol', type: 'Analgesic', description: 'Pain reliever and fever reducer' },
  { id: 'm3', name: 'Ibuprofen', type: 'NSAID', description: 'Reduces inflammation and pain' },
  { id: 'm4', name: 'Omeprazole', type: 'Antacid', description: 'Treats acid reflux and ulcers' },
  { id: 'm5', name: 'Cetirizine', type: 'Antihistamine', description: 'Allergy relief medication' },
  { id: 'm6', name: 'Azithromycin', type: 'Antibiotic', description: 'Macrolide antibiotic' },
];

export const MedicineSearchPanel: React.FC = () => {
  const [query, setQuery] = useState('');

  const filtered = MOCK_MEDICINES.filter(m => 
    m.name.toLowerCase().includes(query.toLowerCase()) || 
    m.type.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-muted/20 border-r">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <LuListFilter size={14} /> Medicine Database
        </h3>
        <div className="relative">
          <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <Input 
            placeholder="Search medicines..." 
            className="pl-8 h-9 text-sm bg-background"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3 pb-8">
          {filtered.length > 0 ? (
            filtered.map((med) => (
              <DraggableMedicineCard 
                key={med.id} 
                id={med.id} 
                medicine={med} 
              />
            ))
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No medicines found matching "{query}"
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
