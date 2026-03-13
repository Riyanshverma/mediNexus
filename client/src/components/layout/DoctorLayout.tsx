import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../shared/Navbar';
import { Sidebar } from '../shared/Sidebar';
import { ROUTES } from '../../lib/constants';
import { LuLayoutDashboard, LuCalendar, LuSettings } from 'react-icons/lu';

export const DoctorLayout: React.FC = () => {
  const sidebarLinks = [
    { icon: <LuLayoutDashboard size={20} />, label: 'Dashboard', path: ROUTES.DOCTOR.DASHBOARD },
    { icon: <LuCalendar size={20} />, label: 'Schedule', path: ROUTES.DOCTOR.SCHEDULE },
    { icon: <LuSettings size={20} />, label: 'Settings', path: '#' },
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
