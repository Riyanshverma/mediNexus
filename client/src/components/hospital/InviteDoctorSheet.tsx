import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "../ui/sheet";
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { LuUserPlus, LuMail } from 'react-icons/lu';
import toast from 'react-hot-toast';

interface InviteDoctorSheetProps {
  children?: React.ReactNode;
}

export const InviteDoctorSheet: React.FC<InviteDoctorSheetProps> = ({ children }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success(`Invitation sent to Dr. ${name || email}`);
      setLoading(false);
      setOpen(false);
      setEmail('');
      setName('');
      setSpecialty('');
    }, 1000);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button className="gap-2">
            <LuUserPlus size={16} />
            Invite Doctor
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <LuUserPlus className="text-primary" /> Invite New Doctor
          </SheetTitle>
          <SheetDescription>
            Send an onboarding invitation to a doctor to join your hospital's roster. They will receive an email with login instructions.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleInvite} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doctor-email">Email Address <span className="text-destructive">*</span></Label>
              <div className="relative">
                <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input 
                  id="doctor-email" 
                  type="email" 
                  placeholder="doctor@example.com" 
                  className="pl-9"
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="doctor-name">Full Name <span className="text-destructive">*</span></Label>
              <Input 
                id="doctor-name" 
                placeholder="Dr. John Doe" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="doctor-specialty">Specialty</Label>
              <Input 
                id="doctor-specialty" 
                placeholder="e.g. Cardiologist, General Physician" 
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground mt-1">This helps categorize them in the search directory.</p>
            </div>
          </div>
          
          <SheetFooter className="mt-8 sm:mt-12">
            <SheetClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto">Cancel</Button>
            </SheetClose>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto mt-2 sm:mt-0">
              {loading ? 'Sending Invite...' : 'Send Invitation'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
