import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ROUTES } from '../../lib/constants';
import { LuClock, LuArrowRight, LuBellRing } from 'react-icons/lu';

export const WaitlistJoined: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
        <LuClock size={48} />
      </div>
      
      <h1 className="text-3xl font-bold mb-2">You're on the Waitlist</h1>
      <p className="text-muted-foreground mb-8">
        We've added your name to the queue. You'll be notified automatically if an earlier slot becomes available.
      </p>

      <div className="bg-muted/30 border rounded-2xl p-6 w-full mb-8 text-left space-y-4">
        <div className="flex items-start gap-4">
          <div className="mt-1 bg-primary/10 p-2 rounded-lg text-primary">
            <LuBellRing size={20} />
          </div>
          <div>
            <h3 className="font-semibold">How it works</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Keep an eye on your notifications. If someone cancels, we'll send you an alert. You'll have 10 minutes to claim the newly opened slot.
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
          Explore Doctors
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
