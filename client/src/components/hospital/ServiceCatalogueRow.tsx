import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { LuPenLine, LuTrash2, LuCheck, LuX } from 'react-icons/lu';

interface ServiceCatalogueRowProps {
  id: string;
  name: string;
  description?: string;
  onUpdate: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

export const ServiceCatalogueRow: React.FC<ServiceCatalogueRowProps> = ({ 
  id, 
  name, 
  description,
  onUpdate, 
  onDelete 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);

  const handleSave = () => {
    if (editValue.trim() && editValue !== name) {
      onUpdate(id, editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(name);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-card border rounded-xl hover:shadow-sm transition-shadow group">
      {isEditing ? (
        <div className="flex-1 flex items-center gap-3 mr-4">
          <Input 
            value={editValue} 
            onChange={(e) => setEditValue(e.target.value)}
            className="h-9"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={handleSave}>
              <LuCheck size={16} />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancel}>
              <LuX size={16} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-w-0 pr-4">
          <h4 className="font-semibold text-foreground truncate">{name}</h4>
          {description && <p className="text-sm text-muted-foreground truncate">{description}</p>}
        </div>
      )}

      {!isEditing && (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditing(true)}>
            <LuPenLine size={16} />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(id)}>
            <LuTrash2 size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};
