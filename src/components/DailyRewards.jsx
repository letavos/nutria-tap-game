import { useState, useEffect } from 'react';
import { FaGift, FaCalendar, FaCoins, FaFire, FaStar } from 'react-icons/fa';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import notificationService from '../services/NotificationService';

const DailyRewards = () => {
  const { gameState, claimDailyReward } = useGame();
  const { t } = useLanguage();
  const [showReward, setShowReward] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState('');

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
    const interval = setInterval(updateTimer, 60000); // Atualizar a cada minuto
    
    return () => clearInterval(interval);
  }, []);

  const handleClaim = () => {
    claimDailyReward();
    setShowReward(true);
    setTimeout(() => setShowReward(false), 2000);
  };

  const getRewardAmount = () => {
    const streak = gameState.dailyRewards.streak;
    return Math.floor(100 * Math.pow(1.5, streak));
  };

  const getStreakBonus = () => {
    const streak = gameState.dailyRewards.streak;
    if (streak >= 7) return '🔥 7+ dias!';
    if (streak >= 3) return '⭐ 3+ dias!';
    return '';
  };

  return (
    <div className="daily-rewards-card">
      <div className="daily-rewards-header">
        <FaCalendar className="daily-rewards-icon" />
        <h3>{t('dailyRewardsTitle')}</h3>
        {getStreakBonus() && (
          <span className="streak-bonus">{getStreakBonus()}</span>
        )}
      </div>
      
      <div className="daily-rewards-content">
        <div className="reward-info">
          <div className="reward-amount">
            <FaCoins className="coin-icon" />
            <span>{getRewardAmount().toLocaleString()} pNTR</span>
          </div>
          <div className="reward-streak">
            {t('streakDays').replace('{streak}', gameState.dailyRewards.streak)}
          </div>
        </div>
        
        {gameState.dailyRewards.available ? (
          <button 
            className="claim-reward-btn"
            onClick={handleClaim}
          >
            <FaGift /> {t('claimReward')}
          </button>
        ) : (
          <div className="next-reward">
            <FaCalendar />
            <span>{t('nextReward').replace('{time}', timeUntilNext)}</span>
          </div>
        )}
      </div>
      
      {showReward && (
        <div className="reward-celebration">
          <FaStar className="celebration-star" />
          <span>+{getRewardAmount().toLocaleString()} pNTR!</span>
        </div>
      )}
    </div>
  );
};

export default DailyRewards;
