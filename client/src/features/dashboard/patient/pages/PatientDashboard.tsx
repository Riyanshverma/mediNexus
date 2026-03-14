import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PatientDashboardHeader, PatientHealthPassport, PatientHome, PatientAppointments } from '../..';

export const PatientDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    // If we passed a tab state through React Router's navigate
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
      // Clear the state so refreshing doesn't lock us in this tab
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <PatientHome />;
      case 'appointments':
        return <PatientAppointments />;
      case 'passport':
        return <PatientHealthPassport />;
      default:
        return <PatientHome />;
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