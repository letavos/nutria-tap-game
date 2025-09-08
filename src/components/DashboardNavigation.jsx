import { useState } from 'react';
import { FaGamepad, FaUser, FaTrophy, FaArrowLeft, FaHome } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const DashboardNavigation = ({ currentView, setCurrentView }) => {
  const { t } = useLanguage();

  const navigationItems = [
    { id: 'game', label: t('game'), icon: FaGamepad },
    { id: 'profile', label: t('userProfile'), icon: FaUser },
    { id: 'ranking', label: t('ranking'), icon: FaTrophy }
  ];

  return (
    <div className="dashboard-navigation">
      <div className="nav-container">
        <div className="nav-logo">
          <FaHome className="logo-icon" />
          <span className="logo-text">Nutria Tap</span>
        </div>
        
        <div className="nav-items">
          {navigationItems.map(item => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                onClick={() => setCurrentView(item.id)}
              >
                <IconComponent className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardNavigation;
