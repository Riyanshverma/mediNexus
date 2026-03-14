import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AdminDashboardHeader } from '../components/AdminDashboardHeader';
import { AdminOverview } from '../components/AdminOverview';
import { AdminDoctors } from '../components/AdminDoctors';
import { AdminServices } from '../components/AdminServices';
import { AdminSlots } from '../components/AdminSlots';

export const AdminDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'doctors':
        return <AdminDoctors />;
      case 'services':
        return <AdminServices />;
      case 'slots':
        return <AdminSlots />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <AdminDashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="w-full max-w-7xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
};
