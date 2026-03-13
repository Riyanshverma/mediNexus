import React from 'react';
import { useBookingCountdown } from '../../hooks/useBookingCountdown';
import { Progress } from '../ui/progress';
import { LuClock } from 'react-icons/lu';

export const BookingCountdown: React.FC = () => {
  const { secondsRemaining } = useBookingCountdown();

  if (secondsRemaining <= 0) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  
  // Progress percentage (out of 180 seconds / 3 mins)
  const percentage = (secondsRemaining / 180) * 100;
  
  // Turn red when less than 30 seconds
  const isDanger = secondsRemaining < 30;

  return (
    <div className={`p-4 rounded-lg bg-orange-50 border border-orange-200 mt-4 mb-6 ${isDanger ? 'bg-red-50 border-red-200' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center gap-2 font-medium ${isDanger ? 'text-red-700' : 'text-orange-700'}`}>
          <LuClock size={16} className={isDanger ? 'animate-pulse' : ''} />
          <span>Slot locked</span>
        </div>
        <div className={`font-bold font-mono ${isDanger ? 'text-red-700' : 'text-orange-700'}`}>
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>
      <Progress value={percentage} className={`h-2 [&>div]:bg-orange-500 ${isDanger ? '[&>div]:bg-red-500' : ''}`} />
      <p className={`text-xs mt-2 ${isDanger ? 'text-red-600 font-medium' : 'text-orange-600'}`}>
        Complete your booking before the slot expires.
      </p>
    </div>
  );
};
