import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatCard } from '../../components/shared/StatCard';
import { ROUTES } from '../../lib/constants';
import { LuStethoscope, LuCalendarDays, LuActivity, LuTrendingUp, LuArrowRight } from 'react-icons/lu';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuthStore } from '../../store/authStore';

export const HospitalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <PageHeader 
          title={`Welcome, ${user?.name || 'Admin'}`} 
          description="Manage your hospital's operations, doctors, and appointments."
        />
        <Button onClick={() => navigate(ROUTES.HOSPITAL.DOCTORS)}>
          Manage Roster <LuArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Doctors" value="24" icon={<LuStethoscope size={20} />} description="+2 this month" />
        <StatCard title="Today's Appointments" value="142" icon={<LuCalendarDays size={20} />} description="across all departments" />
        <StatCard title="Active Patients" value="1,204" icon={<LuActivity size={20} />} description="+12% from last week" />
        <StatCard title="Revenue (Today)" value="$12,450" icon={<LuTrendingUp size={20} />} description="+5% from average" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/60 shadow-sm">
          <CardHeader className="bg-muted/30 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Department Activity</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.HOSPITAL.APPOINTMENTS)}>View All</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics'].map((dept, i) => (
                <div key={dept} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {dept.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{dept}</p>
                      <p className="text-sm text-muted-foreground">{10 - i} Doctors Active Now</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{30 + i * 5} Apps Today</p>
                    <p className="text-xs text-emerald-600 font-medium">+{(i + 1) * 2}% vs yesterday</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm flex flex-col">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col gap-3">
            <Button variant="outline" className="justify-start h-12" onClick={() => navigate(ROUTES.HOSPITAL.DOCTORS)}>
              <LuStethoscope className="mr-3 h-5 w-5 text-primary" /> Invite New Doctor
            </Button>
            <Button variant="outline" className="justify-start h-12" onClick={() => navigate(ROUTES.HOSPITAL.SERVICES)}>
              <LuActivity className="mr-3 h-5 w-5 text-emerald-500" /> Update Services Catalogue
            </Button>
            <Button variant="outline" className="justify-start h-12" onClick={() => navigate(ROUTES.HOSPITAL.APPOINTMENTS)}>
              <LuCalendarDays className="mr-3 h-5 w-5 text-blue-500" /> View Master Calendar
            </Button>
            
            <div className="mt-auto pt-6 border-t border-border/50">
              <h4 className="text-sm font-semibold mb-2">System Status</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> All systems operational
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
