import React from 'react';
import { Button } from '../ui/button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  description, 
  actionText, 
  onAction 
}) => {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted bg-background/50 py-16 px-4 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted/50 text-muted-foreground mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} className="mt-6" variant="outline">
          {actionText}
        </Button>
      )}
    </div>
  );
};
