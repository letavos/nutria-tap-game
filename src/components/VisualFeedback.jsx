import { useState, useEffect } from 'react';
import { FaCoins, FaStar, FaFire, FaBolt } from 'react-icons/fa';

const VisualFeedback = ({ trigger, type = 'click', value = 1, position = { x: 0, y: 0 } }) => {
  const [effects, setEffects] = useState([]);

  useEffect(() => {
    if (!trigger) return;

    const newEffect = {
      id: Date.now() + Math.random(),
      type,
      value,
      position: { ...position },
      timestamp: Date.now()
    };

    setEffects(prev => [...prev, newEffect]);

    // Remover efeito após animação
    const timer = setTimeout(() => {
      setEffects(prev => prev.filter(e => e.id !== newEffect.id));
    }, 2000);

    return () => clearTimeout(timer);
  }, [trigger, type, value, position]);

  const getEffectIcon = (type) => {
    switch (type) {
      case 'coin':
        return <FaCoins />;
      case 'critical':
        return <FaStar />;
      case 'streak':
        return <FaFire />;
      case 'upgrade':
        return <FaBolt />;
      default:
        return <FaCoins />;
    }
  };

  const getEffectColor = (type) => {
    switch (type) {
      case 'coin':
        return '#ffb700';
      case 'critical':
        return '#ff007a';
      case 'streak':
        return '#f39c12';
      case 'upgrade':
        return '#6c47ff';
      default:
        return '#1db954';
    }
  };

  return (
    <>
      {effects.map(effect => (
        <div
          key={effect.id}
          className={`visual-feedback ${effect.type}`}
          style={{
            left: effect.position.x,
            top: effect.position.y,
            '--effect-color': getEffectColor(effect.type)
          }}
        >
          <div className="feedback-icon">
            {getEffectIcon(effect.type)}
          </div>
          <div className="feedback-value">
            {effect.type === 'coin' && '+'}
            {effect.value}
            {effect.type === 'critical' && '!'}
          </div>
          {effect.type === 'critical' && (
            <div className="critical-glow" />
          )}
        </div>
      ))}
    </>
  );
};

export default VisualFeedback;
