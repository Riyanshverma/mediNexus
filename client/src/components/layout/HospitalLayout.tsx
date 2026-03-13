import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../shared/Navbar';
import { Sidebar } from '../shared/Sidebar';
import { ROUTES } from '../../lib/constants';
import { LuLayoutDashboard, LuUsers, LuCalendarDays, LuActivity } from 'react-icons/lu';

export const HospitalLayout: React.FC = () => {
  const sidebarLinks = [
    { icon: <LuLayoutDashboard size={20} />, label: 'Overview', path: ROUTES.HOSPITAL.DASHBOARD },
    { icon: <LuUsers size={20} />, label: 'Doctor Roster', path: ROUTES.HOSPITAL.DOCTORS },
    { icon: <LuCalendarDays size={20} />, label: 'Appointments', path: ROUTES.HOSPITAL.APPOINTMENTS },
    { icon: <LuActivity size={20} />, label: 'Services', path: ROUTES.HOSPITAL.SERVICES },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar links={sidebarLinks} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
