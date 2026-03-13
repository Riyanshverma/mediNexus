import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ROUTES } from '../../lib/constants';
import { LuCircleCheck, LuCalendar, LuArrowRight } from 'react-icons/lu';

export const BookingConfirmed: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
        <LuCircleCheck size={48} />
      </div>
      
      <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
      <p className="text-muted-foreground mb-8">
        Your appointment has been successfully scheduled. We've sent a confirmation email with details.
      </p>

      <div className="bg-muted/30 border rounded-2xl p-6 w-full mb-8 text-left space-y-4">
        <div className="flex items-start gap-4">
          <div className="mt-1 bg-primary/10 p-2 rounded-lg text-primary">
            <LuCalendar size={20} />
          </div>
          <div>
            <h3 className="font-semibold">Next Steps</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Please arrive 10 minutes prior to your scheduled time. You can view all your upcoming appointments in your dashboard.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => navigate(ROUTES.PATIENT.SEARCH)}
        >
          Book Another
        </Button>
        <Button 
          className="flex-1"
          onClick={() => navigate(ROUTES.PATIENT.DASHBOARD)}
        >
          Go to Dashboard
          <LuArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
