import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../shared/Navbar';

export const PatientLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};
