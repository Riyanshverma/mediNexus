import React from 'react';
import { Calendar } from '../ui/calendar';
import { Card, CardContent } from '../ui/card';

interface AppointmentCalendarProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  dailyCounts: Record<string, number>; // "YYYY-MM-DD" -> count
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ 
  date, 
  setDate,
  dailyCounts
}) => {
  // Dates with appointments to mark with a dot
  const markedDates = Object.entries(dailyCounts)
    .filter(([, count]) => count > 0)
    .map(([dateStr]) => new Date(dateStr));

  return (
    <Card className="h-full border-border/50">
      <CardContent className="p-4 flex justify-center h-full">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="w-full bg-background rounded-lg pointer-events-auto"
          modifiers={{ booked: markedDates }}
          modifiersClassNames={{ booked: 'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-primary' }}
        />
      </CardContent>
    </Card>
  );
};
