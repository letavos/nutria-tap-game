import { useState, useEffect } from 'react';
import { FaCoins, FaLevelUpAlt, FaFire, FaStar, FaTrophy, FaGift, FaBolt, FaChartLine } from 'react-icons/fa';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';

const Dashboard = () => {
  const { gameState } = useGame();
  const { t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Simular notificações baseadas no progresso
  useEffect(() => {
    const newNotifications = [];
    
    // Notificação de nível
    if (gameState.level > 1) {
      newNotifications.push({
        id: 'level',
        type: 'level',
        title: t('levelReached').replace('{level}', gameState.level),
        message: t('continueProgress'),
        icon: <FaLevelUpAlt />,
        color: 'var(--nutria-green)'
      });
    }
    
    // Notificação de streak
    if (gameState.streak >= 5) {
      newNotifications.push({
        id: 'streak',
        type: 'streak',
        title: `Streak ${gameState.streak}!`,
        message: t('streakFire'),
        icon: <FaFire />,
        color: 'var(--nutria-orange)'
      });
    }
    
    // Notificação de prestígio
    if (gameState.prestige.level > 0) {
      newNotifications.push({
        id: 'prestige',
        type: 'prestige',
        title: `Prestígio ${gameState.prestige.level}`,
        message: t('prestigeMultiplier').replace('{multiplier}', gameState.prestige.multipliers.coins.toFixed(1)),
        icon: <FaStar />,
        color: 'var(--nutria-purple)'
      });
    }
    
    setNotifications(newNotifications);
  }, [gameState.level, gameState.streak, gameState.prestige.level]);

  const getProgressPercentage = (current, max) => {
    return Math.min(100, (current / max) * 100);
  };

  const getNextLevelExp = () => {
    return gameState.experienceToNextLevel - gameState.experience;
  };

  const getAutoClickerInfo = () => {
    if (!gameState.upgrades?.autoClicker || gameState.upgrades.autoClicker.level === 0) return null;
    return {
      level: gameState.upgrades.autoClicker.level,
      value: gameState.upgrades.autoClicker.value,
      interval: gameState.upgrades.autoClicker.interval
    };
  };

  const autoClicker = getAutoClickerInfo();

  return (
    <div className="dashboard">
      {/* Header com estatísticas principais */}
      <div className="dashboard-header">
        <div className="main-stats">
          <div className="stat-card primary">
            <div className="stat-icon">
              <FaCoins />
            </div>
            <div className="stat-content">
              <div className="stat-value">{gameState.coins.toLocaleString()}</div>
              <div className="stat-label">pNTR</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FaLevelUpAlt />
            </div>
            <div className="stat-content">
              <div className="stat-value">{gameState.level}</div>
              <div className="stat-label">{t('level')}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FaFire />
            </div>
            <div className="stat-content">
              <div className="stat-value">{gameState.streak}</div>
              <div className="stat-label">{t('streak')}</div>
            </div>
          </div>
          
          {gameState.prestige.level > 0 && (
            <div className="stat-card prestige">
              <div className="stat-icon">
                <FaStar />
              </div>
              <div className="stat-content">
                <div className="stat-value">{gameState.prestige.level}</div>
                <div className="stat-label">{t('prestige')}</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Notificações */}
        {notifications.length > 0 && (
          <div className="notifications-container">
            <button 
              className="notifications-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaGift />
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </button>
            
            {showNotifications && (
              <div className="notifications-dropdown">
                {notifications.map(notif => (
                  <div key={notif.id} className="notification-item">
                    <div className="notification-icon" style={{ color: notif.color }}>
                      {notif.icon}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">{notif.title}</div>
                      <div className="notification-message">{notif.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progresso do nível */}
      <div className="level-progress-card">
        <div className="progress-header">
          <h3>{t('levelProgress')}</h3>
          <span className="level-info">
            {gameState.experience} / {gameState.experienceToNextLevel} XP
          </span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill"
            style={{ width: `${getProgressPercentage(gameState.experience, gameState.experienceToNextLevel)}%` }}
          ></div>
        </div>
        <div className="progress-footer">
          <span>{t('nextLevelIn').replace('{exp}', getNextLevelExp())}</span>
        </div>
      </div>

      {/* Informações de upgrades ativos */}
      <div className="active-upgrades-card">
        <h3>{t('activeUpgrades')}</h3>
        <div className="upgrades-grid">
          <div className="upgrade-info">
            <div className="upgrade-icon">
              <FaBolt />
            </div>
            <div className="upgrade-details">
              <div className="upgrade-name">{t('click')}</div>
              <div className="upgrade-value">+{gameState.clickValue} pNTR</div>
            </div>
          </div>
          
          {autoClicker && (
            <div className="upgrade-info">
              <div className="upgrade-icon">
                <FaBolt />
              </div>
              <div className="upgrade-details">
                <div className="upgrade-name">{t('autoClicker')}</div>
                <div className="upgrade-value">+{autoClicker.value.toFixed(1)} pNTR/s</div>
              </div>
            </div>
          )}
          
          {gameState.prestige.level > 0 && (
            <div className="upgrade-info prestige">
              <div className="upgrade-icon">
                <FaStar />
              </div>
              <div className="upgrade-details">
                <div className="upgrade-name">{t('multiplier')}</div>
                <div className="upgrade-value">{gameState.prestige.multipliers.coins.toFixed(1)}x</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="quick-stats-card">
        <h3>{t('statistics')}</h3>
        <div className="quick-stats-grid">
          <div className="quick-stat">
            <span className="quick-stat-label">{t('totalClicks')}</span>
            <span className="quick-stat-value">{gameState.totalClicks.toLocaleString()}</span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat-label">{t('maxStreak')}</span>
            <span className="quick-stat-value">{gameState.maxStreak}</span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat-label">{t('achievements')}</span>
            <span className="quick-stat-value">{gameState.achievements.length}</span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat-label">{t('airdropPoints')}</span>
            <span className="quick-stat-value">{gameState.airdropPoints}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
