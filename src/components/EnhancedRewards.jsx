import { useState, useEffect } from 'react';
import { FaGift, FaCalendar, FaCoins, FaFire, FaStar, FaClock, FaTrophy, FaCrown } from 'react-icons/fa';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import notificationService from '../services/NotificationService';

const EnhancedRewards = () => {
  const { gameState, claimDailyReward, claimWeeklyReward, claimMonthlyReward, claimLoginReward } = useGame();
  const { t } = useLanguage();
  const [showReward, setShowReward] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [timeUntilNext, setTimeUntilNext] = useState('');
  const [currentTab, setCurrentTab] = useState('daily');
  const [loginStreak, setLoginStreak] = useState(0);

  // Calcular streak de login (a cada 7 dias)
  useEffect(() => {
    const today = new Date();
    const startDate = new Date(gameState.startDate || today);
    const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    setLoginStreak(Math.floor(daysDiff / 7));
  }, [gameState.startDate]);

  // Calcular tempo até próxima recompensa
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilNext(`${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleClaim = (type, day = null) => {
    let amount = 0;
    
    switch (type) {
      case 'daily':
        amount = getDailyRewardAmount();
        claimDailyReward();
        break;
      case 'weekly':
        amount = getWeeklyRewardAmount();
        claimWeeklyReward();
        break;
      case 'monthly':
        amount = getMonthlyRewardAmount();
        claimMonthlyReward();
        break;
      case 'login':
        amount = getLoginRewardAmount(day);
        claimLoginReward(day);
        break;
    }
    
    setRewardAmount(amount);
    setShowReward(true);
    setTimeout(() => setShowReward(false), 2000);
  };

  const getDailyRewardAmount = () => {
    const streak = gameState.rewards?.daily?.streak || 0;
    return Math.floor(100 * Math.pow(1.5, streak));
  };

  const getWeeklyRewardAmount = () => {
    const week = Math.floor((Date.now() - (gameState.startDate ? new Date(gameState.startDate).getTime() : Date.now())) / (7 * 24 * 60 * 60 * 1000));
    return Math.floor(500 * Math.pow(1.2, week));
  };

  const getMonthlyRewardAmount = () => {
    const month = Math.floor((Date.now() - (gameState.startDate ? new Date(gameState.startDate).getTime() : Date.now())) / (30 * 24 * 60 * 60 * 1000));
    return Math.floor(2000 * Math.pow(1.1, month));
  };

  const getLoginRewardAmount = (day) => {
    const rewards = {
      7: 1000,
      14: 2500,
      21: 5000,
      28: 10000
    };
    return rewards[day] || 0;
  };

  const getStreakBonus = () => {
    const streak = gameState.rewards?.daily?.streak || 0;
    if (streak >= 7) return '🔥 7+ dias!';
    if (streak >= 3) return '⭐ 3+ dias!';
    return '';
  };

  const getLoginStreakInfo = () => {
    const currentCycle = (loginStreak % 4) + 1;
    const nextRewardDay = currentCycle * 7;
    const daysUntilNext = nextRewardDay - (loginStreak * 7);
    
    return {
      currentCycle,
      nextRewardDay,
      daysUntilNext: Math.max(0, daysUntilNext)
    };
  };

  const renderDailyRewards = () => (
    <div className="rewards-section daily-rewards">
      <div className="rewards-header">
        <div className="header-content">
          <div className="header-icon">
            <FaCalendar />
          </div>
          <div className="header-text">
            <h3>{t('dailyRewardsTitle')}</h3>
            <p>{t('dailyRewardsDesc')}</p>
          </div>
        </div>
        {getStreakBonus() && (
          <div className="streak-bonus">
            <FaFire />
            <span>{getStreakBonus()}</span>
          </div>
        )}
      </div>
      
      <div className="rewards-content">
        <div className="reward-card">
          <div className="reward-visual">
            <div className="reward-icon">
              <FaCoins />
            </div>
            <div className="reward-amount">
              <span className="amount">{getDailyRewardAmount().toLocaleString()}</span>
              <span className="currency">pNTR</span>
            </div>
          </div>
          
          <div className="reward-details">
            <div className="streak-info">
              <div className="streak-label">{t('streakCurrent')}</div>
              <div className="streak-value">
                <FaFire />
                <span>{gameState.rewards?.daily?.streak || 0} {t('days')}</span>
              </div>
            </div>
            
            <div className="reward-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${Math.min((gameState.rewards?.daily?.streak || 0) * 10, 100)}%` }}
                />
              </div>
              <div className="progress-text">
                {gameState.rewards?.daily?.streak || 0} / 10 {t('days')}
              </div>
            </div>
          </div>
        </div>
        
        <div className="reward-action">
          {gameState.rewards?.daily?.available ? (
            <button 
              className="claim-reward-btn primary"
              onClick={() => handleClaim('daily')}
            >
              <FaGift />
              <span>{t('claimReward')}</span>
            </button>
          ) : (
            <div className="next-reward">
              <FaClock />
              <div className="next-info">
                <span className="next-label">{t('nextRewardIn')}</span>
                <span className="next-time">{timeUntilNext}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderWeeklyRewards = () => (
    <div className="rewards-section weekly-rewards">
      <div className="rewards-header">
        <div className="header-content">
          <div className="header-icon">
            <FaTrophy />
          </div>
          <div className="header-text">
            <h3>{t('weeklyRewardsTitle')}</h3>
            <p>{t('weeklyRewardsDesc')}</p>
          </div>
        </div>
      </div>
      
      <div className="rewards-content">
        <div className="reward-card">
          <div className="reward-visual">
            <div className="reward-icon">
              <FaTrophy />
            </div>
            <div className="reward-amount">
              <span className="amount">{getWeeklyRewardAmount().toLocaleString()}</span>
              <span className="currency">pNTR</span>
            </div>
          </div>
          
          <div className="reward-details">
            <div className="reward-description">
              <p>{t('weeklyRewardDesc')}</p>
            </div>
            
            <div className="reward-bonus">
              <div className="bonus-item">
                <FaStar />
                <span>{t('multiplier')}: 1.2x {t('perWeek')}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="reward-action">
          {gameState.rewards?.weekly?.available ? (
            <button 
              className="claim-reward-btn secondary"
              onClick={() => handleClaim('weekly')}
            >
              <FaTrophy />
              <span>{t('claimWeeklyReward')}</span>
            </button>
          ) : (
            <div className="next-reward">
              <FaClock />
              <div className="next-info">
                <span className="next-label">{t('nextRewardIn')}</span>
                <span className="next-time">7 {t('days')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMonthlyRewards = () => (
    <div className="rewards-section monthly-rewards">
      <div className="rewards-header">
        <div className="header-content">
          <div className="header-icon">
            <FaCrown />
          </div>
          <div className="header-text">
            <h3>{t('monthlyRewardsTitle')}</h3>
            <p>{t('monthlyRewardsDesc')}</p>
          </div>
        </div>
      </div>
      
      <div className="rewards-content">
        <div className="reward-card">
          <div className="reward-visual">
            <div className="reward-icon">
              <FaCrown />
            </div>
            <div className="reward-amount">
              <span className="amount">{getMonthlyRewardAmount().toLocaleString()}</span>
              <span className="currency">pNTR</span>
            </div>
          </div>
          
          <div className="reward-details">
            <div className="reward-description">
              <p>{t('monthlyRewardsPremium')}</p>
            </div>
            
            <div className="reward-bonus">
              <div className="bonus-item">
                <FaCrown />
                <span>{t('multiplier')}: 1.1x {t('perMonth')}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="reward-action">
          {gameState.rewards?.monthly?.available ? (
            <button 
              className="claim-reward-btn premium"
              onClick={() => handleClaim('monthly')}
            >
              <FaCrown />
              <span>{t('claimMonthlyReward')}</span>
            </button>
          ) : (
            <div className="next-reward">
              <FaClock />
              <div className="next-info">
                <span className="next-label">{t('nextRewardIn')}</span>
                <span className="next-time">30 {t('days')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLoginRewards = () => {
    const loginInfo = getLoginStreakInfo();
    const rewards = [7, 14, 21, 28];
    
    return (
      <div className="rewards-section login-rewards">
        <div className="rewards-header">
          <div className="header-content">
            <div className="header-icon">
              <FaFire />
            </div>
            <div className="header-text">
              <h3>{t('loginRewardsTitle')}</h3>
              <p>{t('loginRewardsDesc')}</p>
            </div>
          </div>
        </div>
        
        <div className="login-rewards-container">
          <div className="login-rewards-grid">
            {rewards.map(day => {
              const isClaimed = gameState.rewards?.login?.claimed?.includes(day) || false;
              const isNext = day === loginInfo.nextRewardDay && !isClaimed;
              const amount = getLoginRewardAmount(day);
              
              return (
                <div 
                  key={day}
                  className={`login-reward-card ${isClaimed ? 'claimed' : ''} ${isNext ? 'next' : ''}`}
                >
                  <div className="card-header">
                    <div className="day-badge">
                      <FaStar />
                      <span>{t('day')} {day}</span>
                    </div>
                    {isNext && <div className="next-badge">{t('next')}</div>}
                  </div>
                  
                  <div className="card-content">
                    <div className="reward-amount">
                      <span className="amount">{amount.toLocaleString()}</span>
                      <span className="currency">pNTR</span>
                    </div>
                    
                    <div className="reward-status">
                      {isClaimed ? (
                        <div className="claimed-status">
                          <FaStar />
                          <span>{t('claimed')}</span>
                        </div>
                      ) : isNext ? (
                        <button 
                          className="claim-login-btn"
                          onClick={() => handleClaim('login', day)}
                        >
                          <FaGift />
                          <span>{t('claimReward')}</span>
                        </button>
                      ) : (
                        <div className="locked-status">
                          <FaClock />
                          <span>{t('locked')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="login-progress">
            <div className="progress-header">
              <h4>{t('progressCycle')}</h4>
              <span>{loginInfo.currentCycle}/4 {t('cycles')}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(loginInfo.currentCycle / 4) * 100}%` }}
              />
            </div>
            <div className="progress-text">
              {t('loginProgress').replace('{current}', loginInfo.currentCycle).replace('{total}', 4)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'daily', label: t('daily'), icon: <FaCalendar /> },
    { id: 'weekly', label: t('weekly'), icon: <FaClock /> },
    { id: 'monthly', label: t('monthly'), icon: <FaCrown /> },
    { id: 'login', label: t('loginStreak'), icon: <FaFire /> }
  ];

  return (
    <div className="enhanced-rewards-container">
      <div className="rewards-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`rewards-tab ${currentTab === tab.id ? 'active' : ''}`}
            onClick={() => setCurrentTab(tab.id)}
          >
            <div className="tab-icon">{tab.icon}</div>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="rewards-content-container">
        {currentTab === 'daily' && renderDailyRewards()}
        {currentTab === 'weekly' && renderWeeklyRewards()}
        {currentTab === 'monthly' && renderMonthlyRewards()}
        {currentTab === 'login' && renderLoginRewards()}
      </div>
      
      {showReward && (
        <div className="reward-celebration">
          <FaStar className="celebration-star" />
          <span>+{rewardAmount.toLocaleString()} pNTR!</span>
        </div>
      )}
    </div>
  );
};

export default EnhancedRewards;
