import React from 'react';
import { Button } from '../ui/button';
import { LuPlus } from 'react-icons/lu';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  actionText, 
  onAction,
  icon
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          {icon && <span className="text-primary">{icon}</span>}
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actionText && onAction && (
        <Button onClick={onAction} className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
          <LuPlus className="mr-2 h-4 w-4" />
          {actionText}
        </Button>
      )}
    </div>
  );
};
