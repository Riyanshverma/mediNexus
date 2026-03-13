import React, { useState } from 'react';
import { PageHeader } from '../../components/shared/PageHeader';
import { Card, CardContent } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { LuCalendarPlus, LuSave } from 'react-icons/lu';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DaySchedule {
  day: string;
  isWorking: boolean;
  startTime: string;
  endTime: string;
}

export const DoctorSchedule: React.FC = () => {
  const [slotDuration, setSlotDuration] = useState('30');
  const [schedule, setSchedule] = useState<DaySchedule[]>(DAYS.map(day => ({
    day,
    isWorking: day !== 'Sunday',
    startTime: '09:00',
    endTime: '17:00'
  })));

  const handleToggleDay = (dayIndex: number, isWorking: boolean) => {
    setSchedule(prev => prev.map((s, i) => i === dayIndex ? { ...s, isWorking } : s));
  };

  const handleChangeTime = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    setSchedule(prev => prev.map((s, i) => i === dayIndex ? { ...s, [field]: value } : s));
  };

  const handleSave = () => {
    // Simulate API call
    toast.success('Schedule updated successfully');
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <PageHeader 
          title="Working Schedule" 
          description="Define your availability and slot configurations."
        />
        <Button onClick={handleSave} className="gap-2">
          <LuSave size={16} /> Save Changes
        </Button>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <LuCalendarPlus className="text-primary" />
              General Configuration
            </h3>
            <div className="max-w-xs space-y-2">
              <Label htmlFor="slot-duration">Slot Duration (Minutes)</Label>
              <Input 
                id="slot-duration" 
                type="number" 
                value={slotDuration} 
                onChange={(e) => setSlotDuration(e.target.value)} 
                min="5" 
                max="120" 
                step="5"
              />
              <p className="text-xs text-muted-foreground mt-1">This determines how many patients you can see per hour.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0 overflow-hidden divide-y">
            <div className="p-6 bg-muted/30">
              <h3 className="text-lg font-bold">Weekly Availability</h3>
              <p className="text-sm text-muted-foreground">Select which days you work and set your hours.</p>
            </div>
            
            <div className="divide-y">
              {schedule.map((dayConfig, index) => (
                <div key={dayConfig.day} className={`p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${!dayConfig.isWorking ? 'bg-muted/10 opacity-60' : ''}`}>
                  <div className="flex items-center gap-4 w-40">
                    <Switch 
                      checked={dayConfig.isWorking} 
                      onCheckedChange={(c) => handleToggleDay(index, c)} 
                    />
                    <span className="font-medium">{dayConfig.day}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-md">
                    <div className="space-y-1 w-full">
                      <Label className="text-xs sr-only">Start Time</Label>
                      <Input 
                        type="time" 
                        value={dayConfig.startTime} 
                        onChange={(e) => handleChangeTime(index, 'startTime', e.target.value)}
                        disabled={!dayConfig.isWorking}
                      />
                    </div>
                    <span className="text-muted-foreground">to</span>
                    <div className="space-y-1 w-full">
                      <Label className="text-xs sr-only">End Time</Label>
                      <Input 
                        type="time" 
                        value={dayConfig.endTime} 
                        onChange={(e) => handleChangeTime(index, 'endTime', e.target.value)}
                        disabled={!dayConfig.isWorking}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
