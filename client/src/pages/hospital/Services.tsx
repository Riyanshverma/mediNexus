import React, { useState } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { ServiceCatalogueRow } from '../../components/hospital/ServiceCatalogueRow';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { LuPlus } from 'react-icons/lu';
import toast from 'react-hot-toast';

export const HospitalServices: React.FC = () => {
  const [newServiceName, setNewServiceName] = useState('');
  
  // Mock
  const [services, setServices] = useState([
    { id: '1', name: 'Cardiology', description: 'Heart and cardiovascular system care' },
    { id: '2', name: 'Neurology', description: 'Brain and nervous system disorders' },
    { id: '3', name: 'Orthopedics', description: 'Bone and joint care' },
    { id: '4', name: 'Pediatrics', description: 'Child healthcare and development' },
  ]);

  const handleUpdate = (id: string, newName: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s));
    toast.success('Service updated successfully');
  };

  const handleDelete = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    toast.success('Service removed from catalog');
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    const newService = {
      id: crypto.randomUUID(),
      name: newServiceName.trim(),
      description: 'Newly added service'
    };
    
    setServices(prev => [...prev, newService]);
    setNewServiceName('');
    toast.success('Service added to catalog');
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <PageHeader 
        title="Services Catalogue" 
        description="Manage the medical departments and services offered at your facility."
      />

      <div className="bg-card border rounded-xl p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Add New Service</h3>
        <form onSubmit={handleAdd} className="flex gap-4">
          <Input 
            placeholder="e.g. Dermatology, General Surgery" 
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!newServiceName.trim()} className="shrink-0 gap-2">
            <LuPlus size={16} /> Add Service
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold mb-4">Current Services ({services.length})</h3>
        {services.length > 0 ? (
          <div className="grid gap-3">
            {services.map((service) => (
              <ServiceCatalogueRow 
                key={service.id} 
                id={service.id} 
                name={service.name} 
                description={service.description}
                onUpdate={handleUpdate} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-xl bg-card text-muted-foreground border-dashed">
            No services added yet. Add your first service above.
          </div>
        )}
      </div>
    </div>
  );
};
