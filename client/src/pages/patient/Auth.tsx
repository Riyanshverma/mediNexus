import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../lib/constants';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Checkbox } from '../../components/ui/checkbox';
import { LuActivity } from 'react-icons/lu';
import toast from 'react-hot-toast';

export const PatientAuth: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setAuth(
        { id: 'p1', name: 'John Doe', email: 'john@example.com' },
        'patient',
        'mock-token-123'
      );
      toast.success('Successfully logged in');
      navigate(ROUTES.PATIENT.DASHBOARD);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/30">
      <div className="flex-1 hidden lg:flex flex-col bg-primary text-primary-foreground p-12 justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-black/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <LuActivity size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">MediNexus</h1>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-6">
            Your Health,<br />Simplified and Secure.
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-12 max-w-md">
            Access your health passport, book appointments, and manage prescriptions seamlessly all in one place.
          </p>
          
          <div className="flex items-center gap-4 text-sm font-medium">
             <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className={`w-10 h-10 rounded-full border-2 border-primary bg-primary-foreground/20 flex items-center justify-center backdrop-blur text-xs z-[${5-i}]`}>
                   P{i}
                 </div>
               ))}
             </div>
             <p className="text-primary-foreground/90">Join 10,000+ patients today</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-[420px] space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to your patient portal</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" required />
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
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="font-normal text-muted-foreground">Remember me for 30 days</Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input id="firstName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input id="lastName" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="john@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" required />
                  </div>
                  <div className="text-sm text-muted-foreground pb-2">
                    By clicking Create Account, you agree to our <Link to="#" className="underline hover:text-primary">Terms of Service</Link> and <Link to="#" className="underline hover:text-primary">Privacy Policy</Link>.
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
