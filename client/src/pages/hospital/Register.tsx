import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../lib/constants';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { LuBuilding2, LuMapPin, LuArrowLeft } from 'react-icons/lu';
import toast from 'react-hot-toast';

export const HospitalRegister: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setAuth(
        { id: 'h2', name: 'New Registered Hospital', email: 'admin@newhosp.com' },
        'hospital',
        'mock-token-hosp-new'
      );
      toast.success('Hospital Registered Successfully!');
      navigate(ROUTES.HOSPITAL.DASHBOARD);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 text-primary mb-8 ml-2">
          <LuBuilding2 size={24} />
          <span className="text-xl font-bold tracking-tight">MediNexus Enterprise</span>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-muted">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: step === 1 ? '50%' : '100%' }} />
          </div>

          <div className="mb-8 mt-2">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Register Facility</h2>
            <p className="text-muted-foreground text-sm">Join the MediNexus network in minutes</p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hospitalName">Hospital / Clinic Name <span className="text-destructive">*</span></Label>
                  <Input id="hospitalName" placeholder="City General Hospital" required autoFocus />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="regNumber">Registration Number <span className="text-destructive">*</span></Label>
                    <Input id="regNumber" placeholder="HOSP-123456" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact Number <span className="text-destructive">*</span></Label>
                    <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email Address <span className="text-destructive">*</span></Label>
                  <Input id="email" type="email" placeholder="admin@hospital.com" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Create Admin Password <span className="text-destructive">*</span></Label>
                  <Input id="password" type="password" required />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full h-11">
                  Continue to Facility Details
                </Button>
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Already registered? <Link to={ROUTES.HOSPITAL.AUTH} className="font-medium text-primary hover:underline">Sign in instead</Link>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm flex items-center gap-2 mb-4 text-primary">
                    <LuMapPin size={16} /> Location Details
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address <span className="text-destructive">*</span></Label>
                  <Input id="address" placeholder="123 Health Avenue" required autoFocus />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                    <Input id="city" placeholder="New York" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State / Province <span className="text-destructive">*</span></Label>
                    <Input id="state" placeholder="NY" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP / Postal Code <span className="text-destructive">*</span></Label>
                    <Input id="zip" placeholder="10001" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" defaultValue="United States" disabled />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="px-3" disabled={isLoading}>
                  <LuArrowLeft size={18} />
                </Button>
                <Button type="submit" className="flex-1 h-11" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Complete Registration'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
