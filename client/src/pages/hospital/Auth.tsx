import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../lib/constants';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { LuBuilding2 } from 'react-icons/lu';
import toast from 'react-hot-toast';

export const HospitalAuth: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setAuth(
        { id: 'h1', name: 'City Care Hospital', email: 'admin@citycare.com' },
        'hospital',
        'mock-token-hosp'
      );
      toast.success('Signed in to Hospital Portal');
      navigate(ROUTES.HOSPITAL.DASHBOARD);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative order-2 md:order-1">
        <div className="w-full max-w-[420px] space-y-8 bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
              <LuBuilding2 size={24} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Hospital Administration</h2>
            <p className="text-muted-foreground">Sign in to manage your facility</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input id="email" type="email" placeholder="admin@hospital.com" required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="#" className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input id="password" type="password" required />
              </div>
              <div className="flex items-center space-x-2 pb-4">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="font-normal text-muted-foreground">Keep me signed in</Label>
              </div>
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </div>
          </form>
          
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            Want to register your hospital on MediNexus?{' '}
            <Link to={ROUTES.HOSPITAL.REGISTER} className="font-medium text-primary hover:underline">Register Facility</Link>
          </div>
        </div>
      </div>

      <div className="flex-1 hidden md:flex flex-col bg-slate-900 text-white p-12 justify-center relative overflow-hidden order-1 md:order-2">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-primary/90 to-slate-900/80" />
        
        <div className="relative z-10 max-w-xl mx-auto text-center md:text-left">
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Empower your<br />healthcare infrastructure.
          </h2>
          <p className="text-lg text-slate-200 mb-12 max-w-md">
            Streamline your doctor roster, manage unified hospital schedules, and provide a seamless booking experience for your patients.
          </p>
          
          <div className="grid grid-cols-2 gap-6 text-left border-t border-white/20 pt-8 mt-12">
            <div>
              <h4 className="text-xl font-bold mb-2">10x</h4>
              <p className="text-slate-300 text-sm">Faster Patient Onboarding</p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2">99.9%</h4>
              <p className="text-slate-300 text-sm">Uptime & Reliability</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
