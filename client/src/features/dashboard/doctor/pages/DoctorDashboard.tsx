import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DoctorDashboardHeader, DoctorQueue, DoctorSchedule, DoctorPrescriptions, DoctorReferrals, DoctorProfilePage } from '../..';

export const DoctorDashboard = () => {
  const location = useLocation();
  // We use "queue" as the default home view since it's their daily workspace
  const [activeTab, setActiveTab] = useState('queue');
  const [preselectedPatient, setPreselectedPatient] = useState<{ id: string; full_name: string } | null>(null);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
      if (location.state?.preselectedPatient) {
        setPreselectedPatient(location.state.preselectedPatient);
      } else {
        setPreselectedPatient(null);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const renderContent = () => {
    switch (activeTab) {
      case 'queue':
        return <DoctorQueue />;
      case 'schedule':
        return <DoctorSchedule />;
      case 'prescriptions':
        return <DoctorPrescriptions />;
      case 'referrals':
        return <DoctorReferrals preselectedPatient={preselectedPatient} onPreselectedConsumed={() => setPreselectedPatient(null)} />;
      case 'profile':
        return <DoctorProfilePage />;
      default:
        return <DoctorQueue />;
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <DoctorDashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="w-full max-w-7xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
};