import { useState, useEffect } from 'react';
import { FaGem, FaStar, FaCrown, FaTrophy, FaGift, FaLock, FaCheck } from 'react-icons/fa';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';

const Collectibles = () => {
  const { gameState } = useGame();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('pets');
  const [showDetails, setShowDetails] = useState(null);

  const collectibleCategories = [
    { key: 'pets', label: t('pets'), icon: <FaGem /> },
    { key: 'titles', label: t('titles'), icon: <FaCrown /> },
    { key: 'badges', label: t('badges'), icon: <FaTrophy /> },
    { key: 'skins', label: t('skins'), icon: <FaStar /> }
  ];

  const collectibles = {
    pets: [
      {
        id: 'nutria_default',
        name: t('classicNutria'),
        description: t('classicNutriaDesc'),
        rarity: 'common',
        unlocked: true,
        image: '🦫',
        stats: { happiness: 100, energy: 100 }
      },
      {
        id: 'nutria_golden',
        name: t('goldenNutria'),
        description: t('goldenNutriaDesc'),
        rarity: 'rare',
        unlocked: gameState.level >= 10,
        image: '✨',
        stats: { happiness: 120, energy: 110 },
        requirement: t('reachLevel').replace('{level}', '10')
      },
      {
        id: 'nutria_rainbow',
        name: t('rainbowNutria'),
        description: t('rainbowNutriaDesc'),
        rarity: 'epic',
        unlocked: gameState.prestige.level >= 2,
        image: '🌈',
        stats: { happiness: 150, energy: 130 },
        requirement: t('prestigeLevel').replace('{level}', '2')
      },
      {
        id: 'nutria_cosmic',
        name: t('cosmicNutria'),
        description: t('cosmicNutriaDesc'),
        rarity: 'legendary',
        unlocked: gameState.achievements.length >= 15,
        image: '🌌',
        stats: { happiness: 200, energy: 150 },
        requirement: (t('achievementsRequirement')?.replace('{count}', '15')) || '15+ achievements'
      }
    ],
    titles: [
      {
        id: 'starter',
        name: t('beginner'),
        description: t('startJourney'),
        rarity: 'common',
        unlocked: true,
        effect: 'Nenhum'
      },
      {
        id: 'clicker_master',
        name: (t('clickMaster') || 'Click Master'),
        description: (t('youMasterClicking') || 'You master the art of clicking'),
        rarity: 'rare',
        unlocked: gameState.totalClicks >= 10000,
        effect: (t('effectClickBonus') || '+5% pNTR per click'),
        requirement: (t('clicksRequirement')?.replace('{count}', '10000')) || '10,000 clicks'
      },
      {
        id: 'prestige_legend',
        name: (t('prestigeLegend') || 'Prestige Legend'),
        description: (t('youTranscended') || 'You transcended the ordinary'),
        rarity: 'epic',
        unlocked: gameState.prestige.level >= 5,
        effect: (t('effectPrestigeBonus') || '+10% prestige multiplier'),
        requirement: (t('prestigeRequirement')?.replace('{level}', '5')) || 'Prestige level 5'
      },
      {
        id: 'nutria_emperor',
        name: (t('nutriaEmperor') || 'Nutria Emperor'),
        description: (t('highestTitle') || 'The highest possible title'),
        rarity: 'legendary',
        unlocked: gameState.level >= 50 && gameState.prestige.level >= 10,
        effect: (t('effectAllGains') || '+25% all gains'),
        requirement: (t('levelPrestigeRequirement')?.replace('{level}', '50').replace('{prestige}', '10')) || 'Level 50 + Prestige 10'
      }
    ],
    badges: [
      {
        id: 'first_click',
        name: (t('firstClick') || 'First Click'),
        description: (t('beginningOfAll') || 'The beginning of everything'),
        rarity: 'common',
        unlocked: gameState.totalClicks >= 1,
        image: '👆'
      },
      {
        id: 'coin_collector',
        name: (t('coinCollector') || 'Coin Collector'),
        description: (t('youLoveCoins') || 'You love collecting coins'),
        rarity: 'rare',
        unlocked: gameState.coins >= 100000,
        image: '💰',
        requirement: (t('pntrRequirement')?.replace('{amount}', '100,000')) || '100,000 pNTR'
      },
      {
        id: 'streak_king',
        name: (t('streakKing') || 'Streak King'),
        description: (t('noOneKeepsStreak') || 'No one keeps streaks like you'),
        rarity: 'epic',
        unlocked: gameState.maxStreak >= 100,
        image: '🔥',
        requirement: (t('streakRequirement')?.replace('{count}', '100')) || '100 streak'
      },
      {
        id: 'achievement_hunter',
        name: (t('achievementHunter') || 'Achievement Hunter'),
        description: (t('youCollectAchievements') || 'You collect achievements'),
        rarity: 'legendary',
        unlocked: gameState.achievements.length >= 20,
        image: '🏆',
        requirement: (t('achievementsRequirement')?.replace('{count}', '20')) || '20+ achievements'
      }
    ],
    skins: [
      {
        id: 'default_skin',
        name: (t('defaultSkin') || 'Default Skin'),
        description: (t('classicAppearance') || 'Classic appearance'),
        rarity: 'common',
        unlocked: true,
        preview: '🦫'
      },
      {
        id: 'golden_skin',
        name: (t('goldenSkin') || 'Golden Skin'),
        description: (t('shinesLikeGold') || 'Shines like gold'),
        rarity: 'rare',
        unlocked: gameState.level >= 15,
        preview: '✨',
        requirement: (t('levelRequirement')?.replace('{level}', '15')) || 'Level 15'
      },
      {
        id: 'neon_skin',
        name: (t('neonSkin') || 'Neon Skin'),
        description: (t('glowsInTheDark') || 'Glows in the dark'),
        rarity: 'epic',
        unlocked: gameState.prestige.level >= 3,
        preview: '💫',
        requirement: (t('prestigeRequirement')?.replace('{level}', '3')) || 'Prestige level 3'
      },
      {
        id: 'cosmic_skin',
        name: (t('cosmicSkin') || 'Cosmic Skin'),
        description: (t('fromDeepSpace') || 'From the depths of space'),
        rarity: 'legendary',
        unlocked: gameState.achievements.length >= 25,
        preview: '🌌',
        requirement: (t('achievementsRequirement')?.replace('{count}', '25')) || '25+ achievements'
      }
    ]
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#9ca3af';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getRarityLabel = (rarity) => {
    switch (rarity) {
      case 'common': return 'Comum';
      case 'rare': return 'Raro';
      case 'epic': return 'Épico';
      case 'legendary': return 'Lendário';
      default: return 'Desconhecido';
    }
  };

  const currentCollectibles = collectibles[selectedCategory] || [];

  return (
    <div className="collectibles-container">
      <div className="collectibles-header">
        <h2>{t('collectibles')}</h2>
        <p>{t('collectUnique')}</p>
      </div>

      <div className="collectibles-categories">
        {collectibleCategories.map(category => (
          <button
            key={category.key}
            className={`category-btn${selectedCategory === category.key ? ' active' : ''}`}
            onClick={() => setSelectedCategory(category.key)}
          >
            {category.icon}
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      <div className="collectibles-grid">
        {currentCollectibles.map(item => (
          <div
            key={item.id}
            className={`collectible-card ${item.rarity}${item.unlocked ? ' unlocked' : ' locked'}`}
            onClick={() => setShowDetails(item)}
          >
            <div className="collectible-header">
              <div className="collectible-image">
                {item.image || item.preview || '🎁'}
              </div>
              <div className="collectible-rarity" style={{ color: getRarityColor(item.rarity) }}>
                {t(getRarityLabel(item.rarity).toLowerCase())}
              </div>
            </div>
            
            <div className="collectible-content">
              <h3 className="collectible-name">{item.name}</h3>
              <p className="collectible-description">{item.description}</p>
              
              {item.stats && (
                <div className="collectible-stats">
                  <div className="stat">
                    <span>{t('happiness')}: {item.stats.happiness}</span>
                  </div>
                  <div className="stat">
                    <span>{t('energy')}: {item.stats.energy}</span>
                  </div>
                </div>
              )}
              
              {item.effect && (
                <div className="collectible-effect">
                  <strong>{t('effect') || 'Effect'}:</strong> {item.effect}
                </div>
              )}
            </div>
            
            <div className="collectible-footer">
              {item.unlocked ? (
                <div className="unlocked-badge">
                  <FaCheck />
                  <span>{t('unlocked')}</span>
                </div>
              ) : (
                <div className="locked-badge">
                  <FaLock />
                  <span>{item.requirement}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showDetails && (
        <div className="collectible-modal-overlay" onClick={() => setShowDetails(null)}>
          <div className="collectible-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{showDetails.name}</h3>
              <button onClick={() => setShowDetails(null)}>×</button>
            </div>
            <div className="modal-content">
              <div className="modal-image">
                {showDetails.image || showDetails.preview || '🎁'}
              </div>
              <div className="modal-info">
                <p className="modal-description">{showDetails.description}</p>
                <div className="modal-rarity" style={{ color: getRarityColor(showDetails.rarity) }}>
                  {t('rarity')}: {t(getRarityLabel(showDetails.rarity).toLowerCase())}
                </div>
                {showDetails.stats && (
                  <div className="modal-stats">
                    <h4>{t('statistics')}:</h4>
                    {Object.entries(showDetails.stats).map(([key, value]) => (
                      <div key={key} className="stat-row">
                        <span>{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {showDetails.effect && (
                  <div className="modal-effect">
                    <h4>{t('effect') || 'Effect'}:</h4>
                    <p>{showDetails.effect}</p>
                  </div>
                )}
                {!showDetails.unlocked && showDetails.requirement && (
                  <div className="modal-requirement">
                    <h4>{t('requirement') || 'Requirement'}:</h4>
                    <p>{showDetails.requirement}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collectibles;
