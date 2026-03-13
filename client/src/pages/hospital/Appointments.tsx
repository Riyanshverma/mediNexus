import React, { useState } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { AppointmentCalendar } from '../../components/hospital/AppointmentCalendar';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { formatTime, formatDate } from '../../lib/date';
import { LuCalendarDays, LuStethoscope, LuClock } from 'react-icons/lu';

export const HospitalAppointments: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Mock calendar data mapping dates to appointment counts
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dailyCounts: Record<string, number> = {
    [today]: 15,
    [tomorrow]: 8,
  };

  // Mock appointments for the selected day
  const dailyAppointments = [
    { id: '1', patient: 'Alice Smith', doctor: 'Dr. Sarah Smith', time: new Date().toISOString(), status: 'scheduled' },
    { id: '2', patient: 'Bob Johnson', doctor: 'Dr. John Doe', time: new Date(Date.now() + 3600000).toISOString(), status: 'in-progress' },
    { id: '3', patient: 'Charlie Brown', doctor: 'Dr. Sarah Smith', time: new Date(Date.now() - 7200000).toISOString(), status: 'completed' },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <PageHeader 
          title="Master Calendar" 
          description="Overview of all appointments across departments."
        />
        <div className="bg-primary/5 text-primary px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <LuCalendarDays size={18} />
          {date ? formatDate(date) : 'Select a date'}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <AppointmentCalendar 
            date={date} 
            setDate={setDate} 
            dailyCounts={dailyCounts} 
          />
        </div>
        
        <div className="lg:col-span-2">
          <Card className="border-border/60 shadow-sm h-full flex flex-col">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>Appointments for {date ? formatDate(date) : ''}</span>
                <Badge variant="secondary">{dailyAppointments.length} Total</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              {dailyAppointments.length > 0 ? (
                <div className="divide-y relative">
                  {/* Mock Time Indicator line */}
                  <div className="absolute left-20 top-1/2 w-full border-t-2 border-primary/50 border-dashed z-0"></div>
                  
                  {dailyAppointments.map((app) => (
                    <div key={app.id} className="p-4 sm:px-6 flex items-start gap-4 hover:bg-muted/20 transition-colors relative z-10 bg-card">
                      <div className="w-16 flex flex-col items-center pt-2 text-muted-foreground shrink-0 text-sm font-medium">
                        <LuClock size={14} className="mb-1" />
                        {formatTime(app.time)}
                      </div>
                      <div className="w-px bg-border stretch self-stretch min-h-[60px]"></div>
                      <div className="flex-1 bg-muted/30 rounded-xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border bg-background">
                            <AvatarFallback>{app.patient.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{app.patient}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <LuStethoscope size={12} /> {app.doctor}
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          app.status === 'completed' ? 'secondary' : 
                          app.status === 'in-progress' ? 'default' : 'outline'
                        } className="capitalize">
                          {app.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <LuCalendarDays size={48} className="opacity-20 mb-4" />
                  <p>No appointments scheduled for this day.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
