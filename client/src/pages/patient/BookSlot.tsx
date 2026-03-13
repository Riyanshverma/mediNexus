import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar } from '../../components/ui/calendar';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { PageHeader } from '../../components/shared/PageHeader';
import { SlotGrid } from '../../components/patient/SlotGrid';
import { BookingCountdown } from '../../components/patient/BookingCountdown';
import type { Doctor } from '../../types/doctor';
import { useBookingStore } from '../../store/bookingStore';
import { formatTime, formatDate } from '../../lib/date';
import { ROUTES } from '../../lib/constants';
import toast from 'react-hot-toast';

export const BookSlot: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [symptoms, setSymptoms] = useState('');
  const [useWallet, setUseWallet] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  
  const { lockedSlot, clearBooking } = useBookingStore();

  const { data: doctor } = useQuery<Doctor>({
    queryKey: ['doctor', doctorId],
    queryFn: async () => {
      // Mock fetch
      return { id: doctorId!, hospitalId: 'h1', name: 'Dr. Sarah Smith', specialty: 'General Physician', qualification: 'MBBS, MD', experienceYears: 10, consultationFee: 50, rating: 4.8 };
    }
  });

  const handleConfirmBooking = async () => {
    if (!lockedSlot) return;
    
    setIsBooking(true);
    try {
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      clearBooking();
      navigate(ROUTES.PATIENT.BOOKING_CONFIRMED);
    } catch (e) {
      toast.error('Failed to confirm booking');
    } finally {
      setIsBooking(false);
    }
  };

  if (!doctor) return null;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <PageHeader 
        title={`Book Appointment with ${doctor.name}`}
        description={`${doctor.specialty} • ${doctor.experienceYears} Years Experience`}
      />

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">1. Select Date</h3>
              <div className="flex justify-center border rounded-xl p-4 bg-muted/20">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border-0 pointer-events-auto shadow-sm bg-background"
                  disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">2. Select Time Slot</h3>
              {date ? (
                <SlotGrid doctorId={doctorId!} />
              ) : (
                <p className="text-muted-foreground text-center py-8 bg-muted/20 rounded-xl border border-dashed">
                  Please select a date first
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">3. Add Details <span className="text-muted-foreground text-sm font-normal">(Optional)</span></h3>
              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms or reason for visit</Label>
                <Textarea 
                  id="symptoms" 
                  placeholder="I have been experiencing mild fever and headache for 2 days..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="resize-none"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 sticky top-24">
          <Card className="border-primary/20 shadow-md">
            <CardContent className="p-6">
              <h3 className="font-bold text-xl mb-6">Booking Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{date ? formatDate(date) : '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium text-primary">
                    {lockedSlot ? formatTime(lockedSlot.startTime) : 'Select a slot'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctor Fee:</span>
                  <span className="font-medium">${doctor.consultationFee}</span>
                </div>
              </div>

              <BookingCountdown />

              <Separator className="my-6" />

              <div className="flex items-center justify-between space-x-2 mb-6 p-4 rounded-lg bg-muted/50 border">
                <div>
                  <Label htmlFor="wallet" className="font-semibold text-base block mb-1">Use Wallet Balance</Label>
                  <span className="text-sm text-muted-foreground">Available: $150.00</span>
                </div>
                <Switch 
                  id="wallet" 
                  checked={useWallet}
                  onCheckedChange={setUseWallet}
                />
              </div>

              <div className="flex justify-between items-center mb-6 pt-2">
                <span className="text-lg font-bold">Total Pay:</span>
                <span className="text-2xl font-bold text-primary">
                  ${useWallet ? Math.max(0, doctor.consultationFee - 150).toFixed(2) : doctor.consultationFee.toFixed(2)}
                </span>
              </div>

              <Button 
                className="w-full h-12 text-lg" 
                disabled={!lockedSlot || isBooking}
                onClick={handleConfirmBooking}
              >
                {isBooking ? 'Processing...' : 'Confirm Booking'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
