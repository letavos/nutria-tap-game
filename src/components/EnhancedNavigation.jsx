import React from 'react';
import { 
  FaGamepad, 
  FaChartLine, 
  FaEllipsisH, 
  FaHome,
  FaTrophy,
  FaGift,
  FaCog,
  FaQuestionCircle,
  FaBell
} from 'react-icons/fa';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';

const EnhancedNavigation = ({ currentTab, setCurrentTab }) => {
  const { gameState } = useGame();
  const { t } = useLanguage();

  const navigationItems = [
    {
      id: 'game',
      label: t('game'),
      icon: <FaGamepad />,
      badge: null
    },
    {
      id: 'dashboard',
      label: t('dashboard'),
      icon: <FaHome />,
      badge: null
    },
    {
      id: 'stats',
      label: t('stats'),
      icon: <FaChartLine />,
      badge: null
    },
    {
      id: 'achievements',
      label: t('achievements'),
      icon: <FaTrophy />,
      badge: gameState.achievements.length > 0 ? gameState.achievements.length : null
    },
    {
      id: 'rewards',
      label: t('rewards'),
      icon: <FaGift />,
      badge: gameState.rewards?.daily?.available ? '!' : null
    }
  ];



  const getNotificationCount = () => {
    let count = 0;
    if (gameState.rewards?.daily?.available) count++;
    if (gameState.rewards?.weekly?.available) count++;
    if (gameState.rewards?.monthly?.available) count++;
    if (gameState.achievements?.length > 0) count++;
    if (gameState.prestige?.level > 0) count++;
    return count;
  };

  return (
    <div className="enhanced-navigation">
      {/* Navegação principal */}
      <div className="nav-main">
        {navigationItems.map(item => (
          <button
            key={item.id}
            className={`nav-item${currentTab === item.id ? ' active' : ''}`}
            onClick={() => setCurrentTab(item.id)}
          >
            <div className="nav-icon">
              {item.icon}
              {item.badge && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </div>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
        
        {/* Botão "Mais" */}
        <button
          className={`nav-item more-btn${currentTab === 'more' ? ' active' : ''}`}
          onClick={() => setCurrentTab('more')}
        >
          <div className="nav-icon">
            <FaEllipsisH />
            {getNotificationCount() > 0 && (
              <span className="nav-badge notification">{getNotificationCount()}</span>
            )}
          </div>
          <span className="nav-label">{t('more')}</span>
        </button>
      </div>

    </div>
  );
};

export default EnhancedNavigation;
