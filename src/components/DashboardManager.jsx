import { useState } from 'react';
import DashboardNavigation from './DashboardNavigation';
import AuthDashboard from './AuthDashboard';
import RankingDashboard from './RankingDashboard';
import NutriaGame from './NutriaGame';

const DashboardManager = () => {
  const [currentView, setCurrentView] = useState('game');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'profile':
        return <AuthDashboard />;
      case 'ranking':
        return <RankingDashboard />;
      case 'game':
      default:
        return <NutriaGame />;
    }
  };

  return (
    <div className="dashboard-manager">
      <DashboardNavigation currentView={currentView} setCurrentView={setCurrentView} />
      <div className="dashboard-content">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default DashboardManager;
