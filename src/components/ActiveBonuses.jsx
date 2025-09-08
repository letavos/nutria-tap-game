import { useState, useEffect } from 'react';
import { FaBolt, FaClock, FaStar } from 'react-icons/fa';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';

const ActiveBonuses = () => {
  const { gameState } = useGame();
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const updateTimers = () => {
      const now = Date.now();
      const newTimeLeft = {};
      
      gameState.activeBonuses.forEach(bonus => {
        const elapsed = now - bonus.startTime;
        const remaining = Math.max(0, bonus.duration - elapsed);
        newTimeLeft[bonus.id] = Math.ceil(remaining / 1000);
      });
      
      setTimeLeft(newTimeLeft);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    
    return () => clearInterval(interval);
  }, [gameState.activeBonuses]);

  if (gameState.activeBonuses.length === 0) {
    return null;
  }

  const formatTime = (seconds) => {
    if (seconds <= 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getBonusIcon = (type) => {
    switch (type) {
      case 'multiplier':
        return <FaBolt className="bonus-icon multiplier" />;
      default:
        return <FaStar className="bonus-icon" />;
    }
  };

  const getBonusColor = (type) => {
    switch (type) {
      case 'multiplier':
        return 'var(--nutria-gold)';
      default:
        return 'var(--nutria-blue)';
    }
  };

  return (
    <div className="active-bonuses">
      <h4 className="bonuses-title">{t('activeBonuses')}</h4>
      <div className="bonuses-list">
        {gameState.activeBonuses.map(bonus => (
          <div 
            key={bonus.id} 
            className="bonus-item"
            style={{ borderColor: getBonusColor(bonus.type) }}
          >
            {getBonusIcon(bonus.type)}
            <div className="bonus-info">
              <span className="bonus-name">
                {bonus.type === 'multiplier' ? t('multiplier') : t('bonus')}
              </span>
              <span className="bonus-value">
                {bonus.value}x
              </span>
            </div>
            <div className="bonus-timer">
              <FaClock className="timer-icon" />
              <span>{formatTime(timeLeft[bonus.id] || 0)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveBonuses;
