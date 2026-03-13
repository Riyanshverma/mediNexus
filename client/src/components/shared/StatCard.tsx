import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  description, 
  trend 
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground w-4 h-4">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend && (
              <span className={trend.isPositive ? 'text-emerald-500' : 'text-destructive'}>
                {trend.isPositive ? '+' : '-'}{trend.value}%
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
