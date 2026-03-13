import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export const SkeletonCard: React.FC = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-3 w-[200px]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex justify-between pt-4">
            <Skeleton className="h-9 w-[100px]" />
            <Skeleton className="h-9 w-[100px]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
