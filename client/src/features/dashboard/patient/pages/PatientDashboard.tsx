import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PatientDashboardHeader, PatientHealthPassport, PatientHome, PatientAppointments, WaitlistPanel } from '../..';

export const PatientDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    // If we passed a tab state through React Router's navigate
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
      // Clear the state so refreshing doesn't lock us in this tab
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleOfferAccepted = (slot: any, lockedUntil: string) => {
  navigate('/patient/discover', {
    state: { waitlistSlot: { ...slot, locked_until: lockedUntil } },
  });
};

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <PatientHome setActiveTab={setActiveTab} />;
      case 'appointments':
        return <PatientAppointments setActiveTab={setActiveTab} />;
      case 'waitlist':
        return <WaitlistPanel onOfferAccepted={handleOfferAccepted} />;
      case 'passport':
        return <PatientHealthPassport />;
      default:
        return <PatientHome setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <PatientDashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* 7xl max-width for the main content area to follow header boundaries */}
      <main className="w-full max-w-7xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
};