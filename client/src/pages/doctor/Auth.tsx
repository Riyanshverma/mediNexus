import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../lib/constants';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { RiStethoscopeLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

export const DoctorAuth: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setAuth(
        { id: 'd1', name: 'Dr. Sarah Smith', email: 'sarah@example.com' },
        'doctor',
        'mock-token-doc'
      );
      toast.success('Welcome back, Dr. Smith');
      navigate(ROUTES.DOCTOR.DASHBOARD);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <div className="flex-1 hidden lg:flex flex-col bg-slate-900 text-white p-12 justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20">
              <RiStethoscopeLine size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">MediNexus <span className="text-primary/80 font-normal">Provider</span></h1>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-6 mt-12">
            Elevate your<br />patient care.
          </h2>
          <p className="text-lg text-slate-300 mb-12 max-w-md">
            Manage your queue efficiently, conduct secure video consultations, and issue digital prescriptions with our comprehensive suite.
          </p>
          
          <div className="flex items-center gap-4 text-sm font-medium">
             <div className="flex items-center gap-2 px-4 py-2 border border-slate-700 bg-slate-800/50 rounded-full backdrop-blur">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-slate-300">HIPAA Compliant</span>
             </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-[420px] space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Provider Portal</h2>
            <p className="text-muted-foreground">Sign in to manage your practice</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="doctor@hospital.com" required />
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
                <Label htmlFor="remember" className="font-normal text-muted-foreground">Remember me for 30 days</Label>
              </div>
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>
          
          <div className="text-center text-sm text-muted-foreground">
            Looking to join our network? <Link to="#" className="font-medium text-primary hover:underline">Apply here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
