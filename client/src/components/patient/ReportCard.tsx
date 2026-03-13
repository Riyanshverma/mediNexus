import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { LuFileText, LuDownload, LuEye } from 'react-icons/lu';
import { formatDate } from '../../lib/date';

interface ReportCardProps {
  report: {
    id: string;
    title: string;
    date: string;
    source: string;
    type: string;
  };
}

export const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  return (
    <Card className="hover:shadow-sm transition-all border-border/60">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <LuFileText size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{report.title}</h4>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
            <span className="truncate max-w-[120px]">{report.source}</span>
            <span>•</span>
            <span>{formatDate(report.date, 'MMM dd, yyyy')}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <LuEye size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0 text-primary">
            <LuDownload size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
