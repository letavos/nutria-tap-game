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
        requirement: '15+ conquistas'
      }
    ],
    titles: [
      {
        id: 'starter',
        name: 'Iniciante',
        description: 'O começo de uma grande jornada',
        rarity: 'common',
        unlocked: true,
        effect: 'Nenhum'
      },
      {
        id: 'clicker_master',
        name: 'Mestre dos Cliques',
        description: 'Você domina a arte de clicar',
        rarity: 'rare',
        unlocked: gameState.totalClicks >= 10000,
        effect: '+5% pNTR por clique',
        requirement: '10.000 cliques'
      },
      {
        id: 'prestige_legend',
        name: 'Lenda do Prestígio',
        description: 'Você transcendeu o comum',
        rarity: 'epic',
        unlocked: gameState.prestige.level >= 5,
        effect: '+10% multiplicador de prestígio',
        requirement: 'Prestígio nível 5'
      },
      {
        id: 'nutria_emperor',
        name: 'Imperador Nutria',
        description: 'O mais alto título possível',
        rarity: 'legendary',
        unlocked: gameState.level >= 50 && gameState.prestige.level >= 10,
        effect: '+25% todos os ganhos',
        requirement: 'Nível 50 + Prestígio 10'
      }
    ],
    badges: [
      {
        id: 'first_click',
        name: 'Primeiro Clique',
        description: 'O início de tudo',
        rarity: 'common',
        unlocked: gameState.totalClicks >= 1,
        image: '👆'
      },
      {
        id: 'coin_collector',
        name: 'Colecionador de Moedas',
        description: 'Você ama juntar moedas',
        rarity: 'rare',
        unlocked: gameState.coins >= 100000,
        image: '💰',
        requirement: '100.000 pNTR'
      },
      {
        id: 'streak_king',
        name: 'Rei do Streak',
        description: 'Ninguém mantém streak como você',
        rarity: 'epic',
        unlocked: gameState.maxStreak >= 100,
        image: '🔥',
        requirement: 'Streak de 100'
      },
      {
        id: 'achievement_hunter',
        name: 'Caçador de Conquistas',
        description: 'Você coleciona conquistas',
        rarity: 'legendary',
        unlocked: gameState.achievements.length >= 20,
        image: '🏆',
        requirement: '20+ conquistas'
      }
    ],
    skins: [
      {
        id: 'default_skin',
        name: 'Skin Padrão',
        description: 'Aparência clássica',
        rarity: 'common',
        unlocked: true,
        preview: '🦫'
      },
      {
        id: 'golden_skin',
        name: 'Skin Dourada',
        description: 'Brilha como ouro',
        rarity: 'rare',
        unlocked: gameState.level >= 15,
        preview: '✨',
        requirement: 'Nível 15'
      },
      {
        id: 'neon_skin',
        name: 'Skin Neon',
        description: 'Brilha no escuro',
        rarity: 'epic',
        unlocked: gameState.prestige.level >= 3,
        preview: '💫',
        requirement: 'Prestígio nível 3'
      },
      {
        id: 'cosmic_skin',
        name: 'Skin Cósmica',
        description: 'Das profundezas do espaço',
        rarity: 'legendary',
        unlocked: gameState.achievements.length >= 25,
        preview: '🌌',
        requirement: '25+ conquistas'
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
        <h2>Colecionáveis</h2>
        <p>Colete pets, títulos, badges e skins únicos!</p>
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
                {getRarityLabel(item.rarity)}
              </div>
            </div>
            
            <div className="collectible-content">
              <h3 className="collectible-name">{item.name}</h3>
              <p className="collectible-description">{item.description}</p>
              
              {item.stats && (
                <div className="collectible-stats">
                  <div className="stat">
                    <span>Felicidade: {item.stats.happiness}</span>
                  </div>
                  <div className="stat">
                    <span>Energia: {item.stats.energy}</span>
                  </div>
                </div>
              )}
              
              {item.effect && (
                <div className="collectible-effect">
                  <strong>Efeito:</strong> {item.effect}
                </div>
              )}
            </div>
            
            <div className="collectible-footer">
              {item.unlocked ? (
                <div className="unlocked-badge">
                  <FaCheck />
                  <span>Desbloqueado</span>
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
                  Raridade: {getRarityLabel(showDetails.rarity)}
                </div>
                {showDetails.stats && (
                  <div className="modal-stats">
                    <h4>Estatísticas:</h4>
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
                    <h4>Efeito:</h4>
                    <p>{showDetails.effect}</p>
                  </div>
                )}
                {!showDetails.unlocked && showDetails.requirement && (
                  <div className="modal-requirement">
                    <h4>Requisito:</h4>
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
