import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Contact,
  BriefcaseMedical,
  Search,
  Syringe,
  ShieldPlus,
  Heart,
  MessageSquareShare,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { patientService, type PatientAppointment } from '@/services/patient.service';
import { useAppointmentRefresh } from '@/hooks/useAppointmentRefresh';
import { toast } from 'sonner';

export const PatientHome = ({ setActiveTab }: { setActiveTab?: (tab: string) => void }) => {
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUpcoming = useCallback(() => {
    patientService
      .listAppointments('upcoming')
      .then((res) => setUpcoming((res as any).data?.appointments ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchUpcoming();
  }, [fetchUpcoming]);

  useAppointmentRefresh(fetchUpcoming);

  return (
    <div className="relative p-8 animate-in fade-in duration-700 w-[calc(100%-2rem)] max-w-7xl mx-auto pb-32 overflow-hidden">
      {/* ── Top-Right Gradient Glow ── */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      {/* ── Welcome & System Status ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-3">Welcome Back, Dev</h1>
          <p className="text-[#a1a1aa] text-base leading-relaxed">
            You have no clinical emergencies today. Your current health metrics are within the optimal threshold.
          </p>
        </div>
        

      </div>

      {/* ── Top Main Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
        
        {/* Card 1: Appointments */}
        <div className="relative bg-[#161616] border border-white/5 rounded-2xl p-6 overflow-hidden group">
          <div className="flex justify-between items-start mb-6 z-10 relative">
            <Calendar className="w-5 h-5 text-[#c4b5fd]" />
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-full bg-white/5 text-[#a1a1aa]">
              Active Queue
            </span>
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-white mb-2">Upcoming Appointments</h3>
            <p className="text-sm text-[#71717a] leading-relaxed">
              No scheduled consultations for the next 24 hours.
            </p>
          </div>
          {/* Subtle background number watermark */}
          <div className="absolute -bottom-8 -left-2 text-[120px] font-black text-white/[0.02] leading-none pointer-events-none">
            {upcoming.length}
          </div>
        </div>

        {/* Card 2: Health Passport */}
        <div className="relative bg-[#161616] border border-white/5 rounded-2xl p-6 group cursor-pointer hover:bg-[#1a1a1a] transition-colors" onClick={() => setActiveTab?.('passport')}>
          <div className="mb-6">
            <Contact className="w-5 h-5 text-[#c4b5fd]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Health Passport</h3>
            <p className="text-sm text-[#71717a] leading-relaxed mb-6">
              Access your immutable medical history, immunization records, and diagnostic reports.
            </p>
            <div className="inline-flex items-center gap-2 text-sm font-medium text-[#c084fc] group-hover:text-[#d8b4fe] transition-colors">
              View full records <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Card 3: Find a Doctor */}
        <div className="relative bg-[#161616] border border-white/5 rounded-2xl p-6 cursor-pointer hover:bg-[#1a1a1a] transition-colors" onClick={() => navigate('/patient/discover')}>
          <div className="mb-6">
            <BriefcaseMedical className="w-5 h-5 text-[#c4b5fd]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Find a Doctor</h3>
            <p className="text-sm text-[#71717a] leading-relaxed mb-5">
              Search across our network of Clinical Luminaries and specialized hospitals.
            </p>
            <div className="relative">
              <Input 
                placeholder="Search specialized clinic..." 
                className="bg-black/40 border-white/5 rounded-xl h-10 px-4 text-sm focus-visible:ring-[#5d0ec0]/50 placeholder:text-[#52525b]"
              />
              <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-[#52525b]" />
            </div>
          </div>
        </div>

      </div>

      {/* ── Clinical Quick Actions Divider ── */}
      <div className="text-center mb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#52525b]">
          Clinical Quick Actions
        </span>
      </div>

      {/* ── Quick Actions Horizontal Bar ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        
        <Button 
          variant="outline" 
          className="h-14 bg-[#18181b] border-white/5 hover:bg-[#27272a] hover:text-white text-[#d4d4d8] rounded-2xl shadow-sm transition-all"
          onClick={() => navigate('/patient/discover')}
        >
          <Search className="w-4 h-4 mr-2 text-[#a1a1aa]" />
          <span className="font-semibold text-[13px]">Find a Doctor</span>
        </Button>

        <Button 
          variant="outline" 
          className="h-14 bg-[#18181b] border-white/5 hover:bg-[#27272a] hover:text-white text-[#d4d4d8] rounded-2xl shadow-sm transition-all"
          onClick={() => navigate('/patient/services')}
        >
          <Syringe className="w-4 h-4 mr-2 text-[#a1a1aa]" />
          <span className="font-semibold text-[13px]">Book a Service</span>
        </Button>

        <Button 
          variant="outline" 
          className="h-14 bg-[#18181b] border-white/5 hover:bg-[#27272a] hover:text-white text-[#d4d4d8] rounded-2xl shadow-sm transition-all"
          onClick={() => setActiveTab?.('appointments')}
        >
          <Calendar className="w-4 h-4 mr-2 text-[#a1a1aa]" />
          <span className="font-semibold text-[13px]">My Appointments</span>
        </Button>

        <Button 
          variant="outline" 
          className="h-14 bg-[#18181b] border-white/5 hover:bg-[#27272a] hover:text-white text-[#d4d4d8] rounded-2xl shadow-sm transition-all"
          onClick={() => setActiveTab?.('passport')}
        >
          <ShieldPlus className="w-4 h-4 mr-2 text-[#a1a1aa]" />
          <span className="font-semibold text-[13px]">Health Passport</span>
        </Button>

      </div>

      {/* ── Health Tip of the Day ── */}
      <div className="bg-[#141414] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 hover:border-white/10 transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-[#3f2025] border border-[#5c2a32] flex shrink-0 items-center justify-center shadow-inner">
          <Heart className="w-7 h-7 text-[#fb7185] fill-[#fb7185]/20" />
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-[#fb7185] font-semibold text-lg mb-2">Health Tip of the Day</h3>
          <p className="text-[#a1a1aa] text-[15px] leading-relaxed max-w-3xl">
            Maintaining a consistent sleep cycle of 7-9 hours per day enhances cognitive recovery and regulates your resting heart rate. Try setting a "wind-down" alert 30 minutes before bed.
          </p>
        </div>

        <div className="flex-shrink-0 mt-4 sm:mt-0 self-center">
          <Button 
            variant="secondary" 
            className="bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-full px-6 text-xs font-bold tracking-wider uppercase h-10"
            onClick={() => toast.info('Detailed insights module coming soon!')}
          >
            More Insights
          </Button>
        </div>
      </div>



    </div>
  );
};

