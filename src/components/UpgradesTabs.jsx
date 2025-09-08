import { useState, useEffect } from 'react';
import { FaCoins, FaArrowUp, FaLock, FaBolt, FaCarrot, FaCheckCircle, FaStar } from 'react-icons/fa';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import './UpgradesCarousel.css';

// Componente de efeito de compra
function PurchaseEffect({ active }) {
  const [effects, setEffects] = useState([]);
  
  useEffect(() => {
    if (!active) return;
    
    // Criar múltiplas partículas
    const newEffects = Array.from({ length: 15 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 240 - 120,
      y: Math.random() * 240 - 120,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 0.3,
      color: i % 3 === 0 ? '#ffb700' : i % 3 === 1 ? '#1db954' : '#6c47ff'
    }));
    
    setEffects(prev => [...prev, ...newEffects]);
    
    // Limpar efeitos após a animação
    const timer = setTimeout(() => {
      setEffects([]);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [active]);
  
  return (
    <div className="purchase-effect-container">
      {effects.map(effect => (
        <div
          key={effect.id}
          className="purchase-particle"
          style={{
            left: `calc(50% + ${effect.x}px)`,
            top: `calc(50% + ${effect.y}px)`,
            width: `${effect.size}px`,
            height: `${effect.size}px`,
            backgroundColor: effect.color,
            animationDelay: `${effect.delay}s`
          }}
        />
      ))}
    </div>
  );
}

const getUpgradeTabs = (t) => [
  {
    key: 'clickUpgrade',
    label: t('clickUpgrade'),
    title: t('clickUpgrade'),
    desc: t('clickUpgrade'),
    icon: <FaCarrot color="#ffb347" size={38} />,
    color: 'linear-gradient(135deg, #2e2a23 0%, #a86e3c 100%)',
    buyFunction: 'buyClickUpgrade'
  },
  {
    key: 'autoClicker',
    label: t('autoClicker'),
    title: t('autoClicker'),
    desc: t('autoClicker'),
    icon: <FaBolt color="#ffe066" size={38} />,
    color: 'linear-gradient(135deg, #2e2a23 0%, #6c47ff 100%)',
    buyFunction: 'buyAutoClicker'
  },
  {
    key: 'multiplier',
    label: t('multiplier'),
    title: t('multiplier'),
    desc: t('multiplier'),
    icon: <FaArrowUp color="#6c47ff" size={38} />,
    color: 'linear-gradient(135deg, #2e2a23 0%, #f39c12 100%)',
    buyFunction: 'buyMultiplier'
  },
  {
    key: 'prestige',
    label: t('prestige'),
    title: t('prestigeReset'),
    desc: t('prestigeDescription'),
    icon: <FaStar color="#ffb700" size={38} />,
    color: 'linear-gradient(135deg, #2e2a23 0%, #ffb700 100%)',
    buyFunction: 'performPrestige',
    special: true
  },
];

const UpgradesTabs = () => {
  const { gameState, buyClickUpgrade, buyAutoClicker, buyMultiplier, performPrestige, toggleAutoClicker } = useGame();
  const { t } = useLanguage();
  const [selected, setSelected] = useState(0);
  const [showPurchaseEffect, setShowPurchaseEffect] = useState(false);
  const [showAffordable, setShowAffordable] = useState(false);
  const UPGRADE_TABS = getUpgradeTabs(t);
  const tab = UPGRADE_TABS[selected];
  const upgrade = gameState.upgrades?.[tab.key] || {
    level: 0,
    value: 0,
    cost: 0,
    interval: 0
  };
  
  // Verificar se o upgrade é acessível
  useEffect(() => {
    const isAffordable = gameState.coins >= (upgrade.cost || 0);
    setShowAffordable(isAffordable);
  }, [gameState.coins, upgrade.cost]);

  const handleBuy = () => {
    if (gameState.coins >= (upgrade.cost || 0)) {
      switch (tab.buyFunction) {
        case 'buyClickUpgrade':
          buyClickUpgrade();
          break;
        case 'buyAutoClicker':
          buyAutoClicker();
          break;
        case 'buyMultiplier':
          buyMultiplier();
          break;
        case 'performPrestige':
          performPrestige();
          break;
        default:
          break;
      }
      setShowPurchaseEffect(true);
      setTimeout(() => setShowPurchaseEffect(false), 1000);
    }
  };

  return (
    <div className="upgrades-tabs-wrapper">
      <div className="upgrades-tabs-bar">
        {UPGRADE_TABS.map((t, idx) => (
          <button
            key={t.key}
            className={`upgrades-tab${selected === idx ? ' active' : ''}${t.soon ? ' disabled' : ''}`}
            onClick={() => !t.soon && setSelected(idx)}
            disabled={t.soon}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div 
        className={`upgrade-card tab-card${tab.soon ? ' disabled' : ''}${showAffordable ? ' affordable' : ''}`} 
        style={{ background: tab.color }}
      >
        <PurchaseEffect active={showPurchaseEffect} />
        <div className="upgrade-illustration">{tab.icon}</div>
        <div className="upgrade-title">{tab.title}</div>
        <div className="upgrade-desc">{tab.desc}</div>
        
        <div className="upgrade-stats">
          {tab.key === 'clickUpgrade' && (
            <>
              <div className="upgrade-stat">
                <span className="stat-label">{t('levelLabel')}</span>
                <span className="stat-value">{upgrade.level || 0}</span>
              </div>
              <div className="upgrade-stat">
                <span className="stat-label">{t('valueLabel')}</span>
                <span className="stat-value">+{(upgrade.value || 0)} {t('pointsPerClick')}</span>
              </div>
              <div className="upgrade-stat">
                <span className="stat-label">{t('nextLabel')}</span>
                <span className="stat-value">+{(upgrade.value || 0) + 1} {t('pointsPerClick')}</span>
              </div>
            </>
          )}
          
          {tab.key === 'autoClicker' && (
            <>
              <div className="upgrade-stat">
                <span className="stat-label">{t('levelLabel')}</span>
                <span className="stat-value">{upgrade.level || 0}</span>
              </div>
              <div className="upgrade-stat">
                <span className="stat-label">{t('valueLabel')}</span>
                <span className="stat-value">+{(upgrade.value || 0).toFixed(1)} {t('pointsPerSecond')}</span>
              </div>
              <div className="upgrade-stat">
                <span className="stat-label">{t('intervalLabel')}</span>
                <span className="stat-value">{(upgrade.interval || 0)}ms</span>
              </div>
              {upgrade.level > 0 && (
                <div className="upgrade-stat">
                  <span className="stat-label">{t('statusLabel')}</span>
                  <span className="stat-value">{upgrade.active ? t('active') : t('inactive')}</span>
                </div>
              )}
            </>
          )}
          
          {tab.key === 'multiplier' && (
            <>
              <div className="upgrade-stat">
                <span className="stat-label">{t('levelLabel')}</span>
                <span className="stat-value">{upgrade.level || 0}</span>
              </div>
              <div className="upgrade-stat">
                <span className="stat-label">{t('multiplierLabel')}</span>
                <span className="stat-value">{(upgrade.value || 0)}x</span>
              </div>
              <div className="upgrade-stat">
                <span className="stat-label">{t('durationLabel')}</span>
                <span className="stat-value">30s</span>
              </div>
            </>
          )}
          
          {tab.key === 'prestige' && (
            <>
              <div className="upgrade-stat">
                <span className="stat-label">{t('prestigeLevel')}</span>
                <span className="stat-value">{gameState.prestige?.level || 0}</span>
              </div>
              <div className="upgrade-stat">
                <span className="stat-label">{t('currentMultiplier')}</span>
                <span className="stat-value">{(gameState.prestige?.multipliers?.coins || 1).toFixed(2)}x</span>
              </div>
              <div className="upgrade-stat">
                <span className="stat-label">{t('prestigePoints')}</span>
                <span className="stat-value">{gameState.prestige?.points || 0}</span>
              </div>
            </>
          )}
        </div>
        
        <div className="upgrade-footer">
          <span className={`upgrade-price${showAffordable ? ' can-afford' : ''}`}>
            <FaCoins className="coin-icon" /> 
            <span>{(upgrade.cost || 0).toLocaleString()}</span>
          </span>
          <span className="upgrade-level">
            {tab.key === 'prestige' ? (
              `Prestígio ${gameState.prestige?.level || 0}`
            ) : (
              `Nível ${upgrade.level || 0}`
            )}
            {(upgrade.level || 0) >= 5 && <FaStar className="star-icon" />}
          </span>
        </div>
        
        <button 
          className={`upgrade-buy${showAffordable ? ' can-afford' : ''}${tab.special ? ' special' : ''}`} 
          onClick={handleBuy}
          disabled={!showAffordable}
        >
          {tab.key === 'prestige' ? (
            showAffordable ? t('doPrestige') : t('insufficientCoins')
          ) : (
            showAffordable ? t('buy') : t('insufficientCoins')
          )}
        </button>
        
        {/* Botão para toggle do auto-clicker */}
        {tab.key === 'autoClicker' && upgrade.level > 0 && (
          <button 
            className={`upgrade-buy toggle-btn${upgrade.active ? ' active' : ''}`}
            onClick={toggleAutoClicker}
            style={{ marginTop: '8px' }}
          >
            {upgrade.active ? t('deactivate') : t('activate')} {t('autoClicker')}
          </button>
        )}
      </div>
    </div>
  );
};

export default UpgradesTabs; 