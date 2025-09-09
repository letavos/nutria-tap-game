import { useState, useEffect } from 'react';
import { FaCoins, FaRedo, FaCog, FaQuestionCircle, FaMedal, FaTshirt, FaFlagCheckered, FaGift, FaPalette, FaUndo, FaSave, FaMoon, FaSun, FaTimes, FaTwitter, FaDiscord, FaTelegram, FaGamepad, FaInfoCircle, FaArrowLeft, FaEllipsisH, FaCheck, FaChartLine, FaStar, FaBell, FaUsers, FaTrophy, FaBolt } from 'react-icons/fa';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import syncService from '../services/SyncService';
import notificationService from '../services/NotificationService';
import NutriaClicker from './NutriaClicker';
import UpgradesTabs from './UpgradesTabs';
import Stats from './Stats';
import Referral from './Referral';
import EnhancedRewards from './EnhancedRewards';
import ActiveBonuses from './ActiveBonuses';
import Dashboard from './Dashboard';
import EnhancedNavigation from './EnhancedNavigation';
import Onboarding from './Onboarding';
import ParticleSystem from './ParticleSystem';
import VisualFeedback from './VisualFeedback';
import Collectibles from './Collectibles';
import DynamicEvents from './DynamicEvents';
import NotificationContainer from './NotificationContainer';
import EventsTab from './EventsTab';
import GuildSystem from './GuildSystem';

// Tipos de badges
const getBadgeCategories = (t) => [
  { key: 'progresso', label: t('progress') },
  { key: 'streak', label: t('streak') },
  { key: 'riqueza', label: t('wealth') },
  { key: 'social', label: t('social') },
  { key: 'skins', label: t('skins') },
  { key: 'eventos', label: t('events') },
];

const getBadges = (t) => [
  { id: 'starter', name: t('beginner'), desc: t('startJourney'), category: 'progresso', unlock: state => true },
  { id: 'level5', name: t('level5'), desc: t('reachLevel5'), category: 'progresso', unlock: state => state.achievements.includes('level5') },
  { id: 'level10', name: t('level10'), desc: t('reachLevel10'), category: 'progresso', unlock: state => state.achievements.includes('level10') },
  { id: 'streaker', name: 'Streaker', desc: t('makeStreak10'), category: 'streak', unlock: state => state.achievements.includes('streak10') },
  { id: 'streak25', name: t('streak25'), desc: t('makeStreak25'), category: 'streak', unlock: state => state.achievements.includes('streak25') },
  { id: 'coins100', name: t('coins100'), desc: t('collect100Coins'), category: 'riqueza', unlock: state => state.achievements.includes('coins100') },
  { id: 'rich', name: t('rich'), desc: t('collect1000Coins'), category: 'riqueza', unlock: state => state.achievements.includes('coins1000') },
  { id: 'coins5000', name: t('coins5000'), desc: t('collect5000Coins'), category: 'riqueza', unlock: state => state.achievements.includes('coins5000') },
  { id: 'upgrader', name: t('upgrader'), desc: t('buy5Upgrades'), category: 'progresso', unlock: state => state.achievements.includes('upgrade5') },
  { id: 'referrer', name: t('referrer'), desc: t('bringFriend'), category: 'social', unlock: state => state.achievements.includes('referral1') },
  { id: 'skinner', name: t('skinner'), desc: t('unlockSkin'), category: 'skins', unlock: state => state.achievements.includes('skinUnlock') },
  { id: 'airdropper', name: t('airdropper'), desc: t('reach100Airdrop'), category: 'eventos', unlock: state => state.achievements.includes('airdrop100') },
  { id: 'veteran', name: t('veteran'), desc: t('play7Days'), category: 'progresso', unlock: state => state.achievements.includes('day7') },
  { id: 'badge_natal', name: t('natalino'), desc: t('participateNatal'), category: 'eventos', eventId: 'natal2024', unlock: (state, isEventActive) => isEventActive('natal2024') },
  { id: 'badge_carnaval', name: t('foliao'), desc: t('participateCarnaval'), category: 'eventos', eventId: 'carnaval2025', unlock: (state, isEventActive) => isEventActive('carnaval2025') },
];

const Badges = () => {
  const { gameState, onBadgeUnlocked, isEventActive } = useGame();
  const { t } = useLanguage();
  const [tab, setTab] = useState('progresso');
  const BADGES = getBadges(t);
  const BADGE_CATEGORIES = getBadgeCategories(t);
  const filtered = BADGES.filter(b => b.category === tab);
  
  // Manter a lógica original
  useEffect(() => {
    filtered.forEach(badge => {
      if (typeof badge.unlock === 'function' && badge.unlock(gameState, isEventActive) && !badge._wasUnlocked) {
        onBadgeUnlocked();
        badge._wasUnlocked = true;
      }
    });
    // eslint-disable-next-line
  }, [gameState]);
  
  const unlockedCount = BADGES.filter(b => (typeof b.unlock === 'function' ? b.unlock(gameState, isEventActive) : b.unlock(gameState))).length;
  
  return (
    <div className="badges-container">
    <div className="card badges-card">
        <div className="badges-header">
          <FaMedal size={48} className="badges-header-icon" />
          <h3 className="badges-header-title">{t('badges')}</h3>
          <div className="badges-header-subtitle">
            {t('unlocked')}: <span className="badges-count">{unlockedCount}</span> / {BADGES.length}
        </div>
      </div>
      
        <div className="badge-categories-container">
        {BADGE_CATEGORIES.map(cat => (
          <button 
            key={cat.key} 
              className={`badge-category-btn${tab === cat.key ? ' active' : ''}`}
            onClick={() => setTab(cat.key)}
          >
              <span className="category-btn-text">{cat.label}</span>
          </button>
        ))}
      </div>
      
      <div className="badges-grid">
        {filtered.map(badge => {
          const unlocked = typeof badge.unlock === 'function' ? badge.unlock(gameState, isEventActive) : badge.unlock(gameState);
          const isEvent = !!badge.eventId;
          const eventActive = isEvent ? isEventActive(badge.eventId) : false;
          
          return (
            <div 
              key={badge.id} 
                className={`badge-card${unlocked ? ' unlocked' : ' locked'}`}
                title={badge.desc + (isEvent ? ' (Exclusiva do evento)' : '')}
              >
                <div className="badge-card-content">
                  <div className="badge-card-header">
                    <div className="badge-card-icon">
                      <span className="badge-star">★</span>
                </div>
                {isEvent && (
                      <div className="badge-event-badge" title={t('eventExclusive')}>
                        <FaGift className="badge-event-icon" />
                      </div>
                    )}
                  </div>
                  
                  <div className="badge-card-body">
                    <h4 className="badge-card-name">{t(badge.name)}</h4>
                    <p className="badge-card-desc">{badge.desc}</p>
                  </div>
                  
                  <div className="badge-card-footer">
                {unlocked ? (
                      <div className="badge-status-badge unlocked">
                        <span className="badge-check">✓</span> Desbloqueado
                  </div>
                ) : (
                      <div className="badge-status-badge locked">
                    {isEvent ? (eventActive ? t('available') : t('eventEnded')) : t('locked')}
                      </div>
                )}
                  </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
            <div className="badges-empty">
            {t('noBadgesInCategory')}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

// Tipos de conquistas
const getAchievementCategories = (t) => [
  { key: 'streak', label: t('streak') },
  { key: 'riqueza', label: t('wealth') },
  { key: 'progresso', label: t('progress') },
  { key: 'social', label: t('social') },
  { key: 'eventos', label: t('events') },
];

// Removido ACHIEVEMENTS_EXT - usando getAchievements do GameContext

const Achievements = () => {
  const { gameState, isEventActive, getAchievements } = useGame();
  const { t } = useLanguage();
  const [tab, setTab] = useState('streak');
  const allAchievements = getAchievements(t);
  
  // Eventos iniciais para a categoria 'eventos'
  const getInitialEvents = () => [
    {
      id: 'first_skin',
      name: t('firstSkin'),
      desc: t('unlockSkin'),
      category: 'eventos',
      unlocked: gameState.achievements?.includes('skinUnlock') || false,
      isEvent: false
    },
    {
      id: 'airdrop_100',
      name: t('airdrop100'),
      desc: t('reach100Airdrop'),
      category: 'eventos',
      unlocked: gameState.achievements?.includes('airdrop100') || false,
      isEvent: false
    },
    {
      id: 'conquista_natal',
      name: t('conquista_natal'),
      desc: t('participateNatal'),
      category: 'eventos',
      unlocked: gameState.achievements?.includes('conquista_natal') || false,
      isEvent: true,
      eventId: 'natal2024'
    },
    {
      id: 'conquista_carnaval',
      name: t('conquista_carnaval'),
      desc: t('participateCarnaval'),
      category: 'eventos',
      unlocked: gameState.achievements?.includes('conquista_carnaval') || false,
      isEvent: true,
      eventId: 'carnaval2025'
    }
  ];
  
  const filtered = tab === 'eventos' ? getInitialEvents() : allAchievements.filter(a => a.category === tab);
  const ACHIEVEMENT_CATEGORIES = getAchievementCategories(t);
  return (
    <div className="achievements-container">
    <div className="card achievements-card">
        <div className="achievements-header">
          <FaMedal size={48} className="achievements-header-icon" />
          <h3 className="achievements-header-title">{t('achievementsTitle')}</h3>
          <div className="achievements-header-subtitle">
            {t('unlocked')} <span className="achievements-count">
            {gameState.achievements?.filter(id => {
              const a = allAchievements.find(x => x.id === id);
              return a && (!a.eventId || isEventActive(a.eventId));
            }).length || 0}
          </span> / {allAchievements.length}
        </div>
      </div>
      
        <div className="achievement-categories-container">
        {ACHIEVEMENT_CATEGORIES.map(cat => (
          <button
            key={cat.key}
              className={`achievement-category-btn${tab === cat.key ? ' active' : ''}`}
            onClick={() => setTab(cat.key)}
          >
              <span className="category-btn-text">{cat.label}</span>
          </button>
        ))}
      </div>
      
        <div className="achievements-grid">
        {filtered.map(a => {
          const unlocked = tab === 'eventos' ? a.unlocked : (gameState.achievements?.includes(a.id) || false) && (!a.eventId || isEventActive(a.eventId));
          const isEvent = tab === 'eventos' ? a.isEvent : !!a.eventId;
          const eventActive = isEvent ? isEventActive(a.eventId) : false;
          return (
            <div 
              key={a.id} 
                className={`achievement-card${unlocked ? ' unlocked' : ' locked'}`}
              title={a.desc + (isEvent ? ' (Exclusiva do evento)' : '')}
            >
                <div className="achievement-card-content">
                  <div className="achievement-card-header">
                    <div className="achievement-card-icon">
                <FaMedal className="achievement-icon" />
                </div>
                {isEvent && (
                      <div className="achievement-event-badge" title={t('eventExclusive')}>
                        <FaGift className="achievement-event-icon" />
                      </div>
                    )}
                  </div>
                  
                  <div className="achievement-card-body">
                    <h4 className="achievement-card-name">{a.name}</h4>
                    <p className="achievement-card-desc">{t(a.desc)}</p>
                  </div>
                  
                  <div className="achievement-card-footer">
                {!unlocked && (
                      <div className="achievement-status-badge">
                    {isEvent ? (eventActive ? t('available') : t('outOfEvent')) : t('locked')}
                      </div>
                )}
                  </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
            <div className="achievements-empty">
            {t('noAchievementsInCategory')}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

const Titles = () => {
  const { gameState, equipTitle } = useGame();
  const { t } = useLanguage();
  
  // Dados dos títulos disponíveis
  const TITLES_DATA = [
    {
      id: 'beginner',
      name: t('beginner'),
      desc: t('startJourney'),
      unlocked: true, // Sempre desbloqueado
      equipped: gameState.equippedTitle === 'beginner'
    },
    {
      id: 'streaker',
      name: 'Streaker',
      desc: t('makeStreak10'),
      unlocked: gameState.achievements?.includes('streak10') || false,
      equipped: gameState.equippedTitle === 'streaker'
    },
    {
      id: 'veteran',
      name: t('veteran') || 'Veterano',
      desc: t('play7Days'),
      unlocked: gameState.achievements?.includes('day7') || false,
      equipped: gameState.equippedTitle === 'veteran'
    },
    {
      id: 'top3',
      name: 'Top 3',
      desc: t('top3Ranking'),
      unlocked: false, // Implementar lógica de ranking
      equipped: gameState.equippedTitle === 'top3'
    },
    {
      id: 'christmas',
      name: t('christmas') || 'Natalino',
      desc: t('participateChristmas'),
      unlocked: gameState.achievements?.includes('conquista_natal') || false,
      equipped: gameState.equippedTitle === 'christmas'
    }
  ];

  const unlockedCount = TITLES_DATA.filter(title => title.unlocked).length;
  
  return (
    <div className="titles-container">
      <div className="card titles-card">
        <div className="titles-header">
          <FaMedal size={48} className="titles-header-icon" />
          <h3 className="titles-header-title">{t('titles')}</h3>
          <div className="titles-header-subtitle">
            {t('unlocked')} <span className="titles-count">{unlockedCount}</span> / {TITLES_DATA.length}
          </div>
        </div>
        
        <div className="titles-grid">
          {TITLES_DATA.map(title => (
            <div 
              key={title.id} 
              className={`title-card${title.unlocked ? ' unlocked' : ' locked'}${title.equipped ? ' equipped' : ''}`}
            >
              <div className="title-card-content">
                <div className="title-card-header">
                  <div className="title-card-icon">
                    <FaMedal className="title-icon" />
                  </div>
                </div>
                
                <div className="title-card-body">
                  <h4 className="title-card-name">{title.name}</h4>
                  <p className="title-card-desc">{title.desc}</p>
                </div>
                
                <div className="title-card-footer">
                  {title.equipped ? (
                    <div className="title-status-badge equipped">
                      {t('equipped')}
                    </div>
                  ) : title.unlocked ? (
                    <button 
                      className="title-equip-btn"
                      onClick={() => equipTitle(title.id)}
                    >
                      {t('equip')}
                    </button>
                  ) : (
                    <div className="title-status-badge locked">
                      {t('locked')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Airdrop = () => {
  const { gameState, getAchievements } = useGame();
  const { t } = useLanguage();
  const achievements = getAchievements(t);
  // Progresso para próxima conquista
  const nextAch = achievements.find(a => !gameState.achievements.includes(a.id));
  // Histórico de conquistas recentes
  const recent = [...gameState.achievements].slice(-3).map(id => achievements.find(a => a.id === id));
  // Detalhamento dos pontos
  const clickPoints = Math.floor((gameState.totalClicks || 0) * 0.5);
  const levelPoints = (gameState.level || 1) * 10;
  const achPoints = (gameState.achievements?.length || 0) * 7;
  const upgradePoints = ((gameState.upgrades?.clickUpgrade?.level || 1) - 1) * 3;
  const streakBonus = Math.floor((gameState.maxStreak || 0) / 10) * 5;
  const referralPoints = 0; // implementar lógica de referidos ativos se desejar
  const dailyBonus = (gameState.daysActive?.length || 0) * 10;
  const totalPoints = clickPoints + levelPoints + achPoints + upgradePoints + streakBonus + referralPoints + dailyBonus;
  
  return (
    <div className="airdrop-container">
    <div className="card airdrop-card">
        <div className="airdrop-header">
          <div className="airdrop-icon">🎁</div>
          <h3 className="airdrop-header-title">{t('airdropTitle')}</h3>
          <p className="airdrop-header-subtitle">
            {t('airdropSubtitle')}
          </p>
      </div>
      
        {/* Seção de Explicação de Pontuação */}
        <div className="airdrop-explanation-section">
          <div className="airdrop-explanation-card">
            <h4 className="airdrop-explanation-title">{t('howScoringWorks')}</h4>
            <div className="airdrop-rules-list">
              <div className="airdrop-rule-item">
                <span className="airdrop-rule-icon">🖱️</span>
                <span className="airdrop-rule-text">{t('clickPointsRule')}</span>
              </div>
              <div className="airdrop-rule-item">
                <span className="airdrop-rule-icon">📈</span>
                <span className="airdrop-rule-text">{t('levelPointsRule')}</span>
              </div>
              <div className="airdrop-rule-item">
                <span className="airdrop-rule-icon">🏆</span>
                <span className="airdrop-rule-text">{t('achievementPointsRule')}</span>
              </div>
              <div className="airdrop-rule-item">
                <span className="airdrop-rule-icon">⭐</span>
                <span className="airdrop-rule-text">{t('upgradePointsRule')}</span>
              </div>
              <div className="airdrop-rule-item">
                <span className="airdrop-rule-icon">⚡</span>
                <span className="airdrop-rule-text">{t('streakPointsRule')}</span>
              </div>
              <div className="airdrop-rule-item">
                <span className="airdrop-rule-icon">📅</span>
                <span className="airdrop-rule-text">{t('dailyPointsRule')}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pontuação Total */}
        <div className="airdrop-total-section">
          <div className="airdrop-total-card">
            <h4 className="airdrop-total-title">{t('airdropScore')}</h4>
            <div className="airdrop-total-score">{totalPoints} pNTR</div>
          </div>
          </div>
          
        {/* Detalhamento */}
        <div className="airdrop-details-section">
          <div className="airdrop-details-card">
            <h4 className="airdrop-details-title">{t('details')}:</h4>
            <div className="airdrop-details-list">
              <div className="airdrop-detail-item">
                <span className="airdrop-detail-label">{t('clicks')}:</span>
                <span className="airdrop-detail-value">{gameState.totalClicks || 0} ({clickPoints} {t('points')})</span>
              </div>
              <div className="airdrop-detail-item">
                <span className="airdrop-detail-label">{t('level')}:</span>
                <span className="airdrop-detail-value">{gameState.level || 1} ({levelPoints} {t('points')})</span>
              </div>
              <div className="airdrop-detail-item">
                <span className="airdrop-detail-label">{t('achievements')}:</span>
                <span className="airdrop-detail-value">{gameState.achievements?.length || 0} ({achPoints} {t('points')})</span>
              </div>
              <div className="airdrop-detail-item">
                <span className="airdrop-detail-label">{t('upgrades')}:</span>
                <span className="airdrop-detail-value">{(gameState.upgrades?.clickUpgrade?.level || 1) - 1} ({upgradePoints} {t('points')})</span>
              </div>
              <div className="airdrop-detail-item">
                <span className="airdrop-detail-label">{t('maxStreak')}:</span>
                <span className="airdrop-detail-value">{gameState.maxStreak || 0} ({streakBonus} {t('points')})</span>
              </div>
              <div className="airdrop-detail-item">
                <span className="airdrop-detail-label">{t('activeDays')}:</span>
                <span className="airdrop-detail-value">{gameState.daysActive?.length || 0} ({dailyBonus} {t('points')})</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Próxima Conquista */}
        {nextAch && (
          <div className="airdrop-next-section">
            <div className="airdrop-next-card">
              <h4 className="airdrop-next-title">{t('nextAchievement')} {nextAch.id}</h4>
              <p className="airdrop-next-desc">({nextAch.desc})</p>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

const RANKING_TABS = [
  { key: 'global', label: 'Global' },
  { key: 'group', label: 'Grupos' },
];

const FAKE_PLAYERS_GLOBAL = [
  { name: 'NutriaPro', points: 1200, level: 12, upgrades: 8, achievements: 14 },
  { name: 'StreakMaster', points: 1100, level: 11, upgrades: 7, achievements: 13 },
  { name: 'BadgeHunter', points: 950, level: 10, upgrades: 6, achievements: 12 },
  { name: 'Folião', points: 800, level: 9, upgrades: 5, achievements: 10 },
  { name: 'Natalino', points: 700, level: 8, upgrades: 4, achievements: 9 },
];
const FAKE_PLAYERS_GROUP = [
  { name: 'Amigo1', points: 600, level: 7, upgrades: 3, achievements: 8 },
  { name: 'Amigo2', points: 500, level: 6, upgrades: 2, achievements: 7 },
  { name: 'Amigo3', points: 400, level: 5, upgrades: 2, achievements: 6 },
];

const Ranking = () => {
  const { gameState, equippedTitle, titles } = useGame();
  const [tab, setTab] = useState('global');
  const myPlayer = {
    name: 'Você',
    points: gameState.airdropPoints,
    level: gameState.level,
    upgrades: (gameState.upgrades?.clickUpgrade?.level || 1) - 1,
    achievements: gameState.achievements?.length || 0,
    title: titles?.find(t => t.id === equippedTitle)?.name || '',
  };
  const players = tab === 'global'
    ? [...FAKE_PLAYERS_GLOBAL, myPlayer]
    : [...FAKE_PLAYERS_GROUP, myPlayer];
  const allPlayers = [...players].sort((a, b) =>
    b.points - a.points || b.level - a.level || b.upgrades - a.upgrades || b.achievements - a.achievements
  );
  return (
    <div className="ranking-container">
    <div className="card ranking-card">
        <div className="ranking-header">
          <FaMedal size={48} className="ranking-header-icon" />
          <h3 className="ranking-header-title">Ranking</h3>
      </div>
      
        <div className="ranking-categories-container">
        {RANKING_TABS.map(t => (
          <button 
            key={t.key} 
              className={`ranking-category-btn${tab === t.key ? ' active' : ''}`} 
            onClick={() => setTab(t.key)}
          >
              <span className="category-btn-text">{t.label}</span>
          </button>
        ))}
      </div>
      
        <div className="ranking-grid">
        {allPlayers.map((p, i) => (
          <div 
            key={p.name} 
              className={`ranking-card${p.name === 'Você' ? ' you' : ''}${i < 3 ? ' top-three' : ''}`}
            >
              <div className="ranking-card-content">
                <div className="ranking-card-header">
                  <div className="ranking-position-badge">
                    {i + 1}º
            </div>
            {i === 0 && <FaMedal className="ranking-medal gold" title="Top 1" />}
            {i === 1 && <FaMedal className="ranking-medal silver" title="Top 2" />}
            {i === 2 && <FaMedal className="ranking-medal bronze" title="Top 3" />}
                </div>
                
                <div className="ranking-card-body">
                  <h4 className="ranking-player-name">{p.name}</h4>
                  {p.title && <p className="ranking-player-title">{p.title}</p>}
                  <p className="ranking-player-points">{p.points} pts</p>
                </div>
                
                <div className="ranking-card-footer">
                  <div className="ranking-stats">
                    Nível {p.level} | Upg. {p.upgrades} | Conq. {p.achievements}
                  </div>
                </div>
              </div>
          </div>
        ))}
      </div>
      
      <div className="ranking-your-position">
        Sua posição: <b>{allPlayers.findIndex(p => p.name === 'Você') + 1}º</b>
        </div>
      </div>
    </div>
  );
};

// Placeholder e lógica inicial para Skins
const SKINS = [
  { id: 'default', name: 'Nutria Clássica', unlocked: true, desc: 'Aparência padrão.' },
  { id: 'gold', name: 'Nutria Dourada', unlocked: false, desc: 'Desbloqueie ao atingir nível 10.' },
  { id: 'party', name: 'Nutria Festa', unlocked: false, desc: 'Desbloqueie em eventos especiais.' },
  { id: 'skin_natal', name: 'Nutria Natalina', unlocked: false, desc: 'Exclusiva do evento de Natal!', eventId: 'natal2024' },
  { id: 'skin_carnaval', name: 'Nutria Carnaval', unlocked: false, desc: 'Exclusiva do Carnaval Nutria!', eventId: 'carnaval2025' },
];

const Skins = () => {
  const { gameState, isEventActive } = useGame();
  const { t } = useLanguage();
  // const { setSkin } = useGame(); // Para integração futura
  return (
    <div className="skins-container">
    <div className="card skins-card">
        <div className="skins-header">
          <FaTshirt size={48} className="skins-header-icon" />
          <h3 className="skins-header-title">{t('skins')}</h3>
          <p className="skins-header-subtitle">
            {t('skinsComingSoon')}
        </p>
      </div>
      
      <div className="skins-grid">
        {SKINS.map(skin => {
          const isEvent = !!skin.eventId;
          const eventActive = isEvent ? isEventActive(skin.eventId) : false;
          return (
            <div 
              key={skin.id} 
                className={`skin-card${skin.unlocked || (isEvent && eventActive) ? ' unlocked' : ' locked'}`}
              >
                <div className="skin-card-content">
                  <div className="skin-card-header">
                    <div className="skin-card-icon">
                      <FaTshirt className="skin-icon" />
                    </div>
              {isEvent && (
                      <div className="skin-event-badge" title={t('eventExclusive')}>
                        <FaGift className="skin-event-icon" />
                </div>
              )}
                  </div>
                  
                  <div className="skin-card-body">
                    <h4 className="skin-card-name">{skin.name}</h4>
                    <p className="skin-card-desc">{skin.desc}</p>
                  </div>
                  
                  <div className="skin-card-footer">
              {!skin.unlocked && (
                      <div className="skin-status-badge">
                        {isEvent ? (eventActive ? t('available') : t('eventEnded')) : t('locked')}
                </div>
              )}
            </div>
      </div>
    </div>
  );
          })}
        </div>
      </div>
    </div>
  );
};

const Missions = ({ showNotification }) => {
  const { missions, updateMissionProgress, claimMissionReward, gameState } = useGame();
  const { t } = useLanguage();
  const [tab, setTab] = useState('daily');
  const missionList = missions[tab] || [];

  // Função para resgatar recompensa (adiciona moedas e marca como claim)
  const claimReward = (mission) => {
    if (!mission.completed || mission.claimed) return;
    claimMissionReward(tab, mission.id);
    showNotification(t('rewardClaimed').replace('{reward}', mission.reward), 'success');
    // Aqui pode ser expandido para outros tipos de recompensa
  };

  return (
    <div className="missions-container">
    <div className="card missions-card">
        <div className="missions-header">
          <FaFlagCheckered size={48} className="missions-header-icon" />
          <h3 className="missions-header-title">{t('missions')}</h3>
      </div>
      
        <div className="missions-categories-container">
        <button 
            className={`mission-category-btn${tab === 'daily' ? ' active' : ''}`} 
          onClick={() => setTab('daily')}
        >
            <span className="category-btn-text">{t('daily')}</span>
        </button>
        <button 
            className={`mission-category-btn${tab === 'weekly' ? ' active' : ''}`} 
          onClick={() => setTab('weekly')}
        >
            <span className="category-btn-text">{t('weekly')}</span>
        </button>
      </div>
      
        <div className="missions-grid">
        {missionList.map(mission => {
          const percent = Math.min(100, Math.round((mission.progress / mission.goal) * 100));
          const completed = mission.completed || mission.progress >= mission.goal;
          const claimed = mission.claimed;
          return (
            <div 
              key={mission.id} 
                className={`mission-card${completed ? ' completed' : ''}${claimed ? ' claimed' : ''}`}
              >
                <div className="mission-card-content">
                  <div className="mission-card-header">
                    <div className="mission-card-icon">
                      <FaGift className="mission-icon" />
                </div>
                    <div className="mission-reward-badge">
                      {mission.reward} pNTR
                    </div>
              </div>
              
                  <div className="mission-card-body">
                    <h4 className="mission-card-name">{mission.desc}</h4>
                    <div className="mission-progress-container">
              <div className="mission-progress-bar">
                <div 
                  className="mission-progress-fill" 
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
                      <div className="mission-progress-text">
                        {mission.progress} / {mission.goal}
                      </div>
                    </div>
                </div>
                
                  <div className="mission-card-footer">
                    {completed && !claimed ? (
                  <button 
                    className="mission-claim-btn" 
                    onClick={() => claimReward(mission)}
                  >
                        {t('claimReward')}
                  </button>
                    ) : claimed ? (
                      <div className="mission-status-badge claimed">
                        {t('rewardReceived')}
                      </div>
                    ) : (
                      <div className="mission-status-badge in-progress">
                        {t('inProgress')}
                      </div>
                    )}
                  </div>
              </div>
            </div>
          );
        })}
        {missionList.length === 0 && (
          <div className="missions-empty">
              {t('noMissions')}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

const HelpModal = ({ onClose }) => {
  const { t } = useLanguage();
  return (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-settings" onClick={e => e.stopPropagation()}>
      <h2><FaQuestionCircle /> {t('help')}</h2>
      <ul style={{ textAlign: 'left', margin: '1.2rem 0', color: 'var(--text)', fontSize: 16, lineHeight: 1.6 }}>
        <li dangerouslySetInnerHTML={{ __html: t('helpTip1') }}></li>
        <li dangerouslySetInnerHTML={{ __html: t('helpTip2') }}></li>
        <li dangerouslySetInnerHTML={{ __html: t('helpTip3') }}></li>
        <li dangerouslySetInnerHTML={{ __html: t('helpTip4') }}></li>
        <li dangerouslySetInnerHTML={{ __html: t('helpTip5') }}></li>
      </ul>
      <div style={{ color: 'var(--text)', fontSize: 14 }}>{t('moreOptionsSoon')}</div>
      <button className="button" onClick={onClose}>{t('close')}</button>
    </div>
  </div>
);
};

const MoreMenu = ({ onSelect }) => {
  const { t } = useLanguage();
  return (
  <div className="card more-menu-card">
    <div className="card-header">
      <h3 className="card-title">{t('moreOptions')}</h3>
      <p className="card-subtitle">Explore todas as funcionalidades do jogo</p>
    </div>
    <div className="menu-grid">
      <button className="menu-btn" onClick={() => onSelect('referral')}>
        <FaUsers />
        {t('referrals')}
      </button>
      <button className="menu-btn" onClick={() => onSelect('badges')}>
        <FaMedal />
        {t('badges')}
      </button>
      <button className="menu-btn" onClick={() => onSelect('skins')}>
        <FaTshirt />
        {t('skins')}
      </button>
      <button className="menu-btn" onClick={() => onSelect('titles')}>
        <FaFlagCheckered />
        {t('titles')}
      </button>
      <button className="menu-btn" onClick={() => onSelect('missions')}>
        <FaFlagCheckered />
        {t('missions')}
      </button>
      <button className="menu-btn" onClick={() => onSelect('minigames')}>
        <FaGamepad />
        {t('minigames')}
      </button>
      <button className="menu-btn" onClick={() => onSelect('airdrop')}>
        <FaGift />
        {t('airdrop')}
      </button>
      <button className="menu-btn" onClick={() => onSelect('ranking')}>
        <FaTrophy />
        {t('ranking')}
      </button>
      <button className="menu-btn" onClick={() => onSelect('achievements')}>
        <FaMedal />
        {t('achievements')}
      </button>
      <button className="menu-btn return" onClick={() => onSelect('game')}>
        <FaArrowLeft />
        {t('return')}
      </button>
    </div>
  </div>
);
};

// Placeholder visual premium para Mini-games
const MiniGames = () => {
  const { t } = useLanguage();
  return (
    <div className="minigames-container">
  <div className="card minigames-card">
        <div className="minigames-header">
          <div className="minigames-icon">🎮</div>
          <h3 className="minigames-header-title">{t('minigamesTitle')}</h3>
          <p className="minigames-header-subtitle">
            {t('minigamesComingSoon')}<br />
            <span className="minigames-status">
              {t('minigamesDescription')}
        </span>
      </p>
    </div>
        
        <div className="minigames-grid">
          <div className="minigame-card">
            <div className="minigame-card-content">
              <div className="minigame-card-header">
                <div className="minigame-card-icon">🎯</div>
              </div>
              
              <div className="minigame-card-body">
                <h4 className="minigame-card-name">Nutria Target</h4>
                <p className="minigame-card-desc">Acertar alvos para ganhar pontos extras</p>
              </div>
              
              <div className="minigame-card-footer">
                <div className="minigame-status-badge">
                  Em Breve
                </div>
              </div>
            </div>
          </div>
          
          <div className="minigame-card">
            <div className="minigame-card-content">
              <div className="minigame-card-header">
                <div className="minigame-card-icon">🧩</div>
              </div>
              
              <div className="minigame-card-body">
                <h4 className="minigame-card-name">Nutria Puzzle</h4>
                <p className="minigame-card-desc">Resolva quebra-cabeças para desbloquear recompensas</p>
              </div>
              
              <div className="minigame-card-footer">
                <div className="minigame-status-badge">
                  Em Breve
                </div>
              </div>
            </div>
          </div>
          
          <div className="minigame-card">
            <div className="minigame-card-content">
              <div className="minigame-card-header">
                <div className="minigame-card-icon">🏃</div>
              </div>
              
              <div className="minigame-card-body">
                <h4 className="minigame-card-name">Nutria Runner</h4>
                <p className="minigame-card-desc">Corra e colete moedas no estilo endless runner</p>
              </div>
              
              <div className="minigame-card-footer">
                <div className="minigame-status-badge">
                  Em Breve
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  </div>
);
};

// Utilitário para contraste automático
function getContrastYIQ(hexcolor) {
  hexcolor = hexcolor.replace('#', '');
  if (hexcolor.length === 3) hexcolor = hexcolor.split('').map(x => x + x).join('');
  const r = parseInt(hexcolor.substr(0,2),16);
  const g = parseInt(hexcolor.substr(2,2),16);
  const b = parseInt(hexcolor.substr(4,2),16);
  const yiq = ((r*299)+(g*587)+(b*114))/1000;
  return yiq >= 128 ? '#23273a' : '#f4f8fb';
}

const CustomizationPanel = ({ customization, updateCustomization, resetCustomization, getCircleColors, getBorderStyles, getBgStyles, getEffects, theme }) => {
  const { t } = useLanguage();
  const CIRCLE_COLORS = getCircleColors(t);
  const BORDER_STYLES = getBorderStyles(t);
  const BG_STYLES = getBgStyles(t);
  const EFFECTS = getEffects(t);
  const [draft, setDraft] = useState(customization);
  // Preview ao vivo
  useEffect(() => {
    // Aplicar cor do círculo
    document.documentElement.style.setProperty('--circle-bg', CIRCLE_COLORS.find(c => c.id === draft.circleColor)?.value || '#2ecc71');
    
    // Aplicar estilo de borda
    document.documentElement.style.setProperty('--circle-border', draft.borderStyle === 'pulse' ? '#f39c12' : draft.borderStyle === 'glow' ? '#ffe066' : draft.borderStyle === 'gradient' ? 'linear-gradient(90deg,#2ecc71,#f39c12)' : '#2ecc71');
    
    // Aplicar fundo customizado
    let bg = 'var(--background)';
    if (draft.backgroundStyle === 'gradient1') bg = 'linear-gradient(135deg, rgba(46, 204, 113, 0.1), rgba(243, 156, 18, 0.1))';
    if (draft.backgroundStyle === 'gradient2') bg = 'linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(155, 89, 182, 0.1))';
    if (draft.backgroundStyle === 'gradient3') bg = 'linear-gradient(135deg, rgba(0, 255, 170, 0.1), rgba(255, 0, 128, 0.1))';
    document.documentElement.style.setProperty('--custom-bg', bg);
    
    // Aplicar efeitos visuais
    document.body.classList.remove('effect-shine', 'effect-particles');
    if (draft.effects === 'shine') {
      document.body.classList.add('effect-shine');
    } else if (draft.effects === 'particles') {
      document.body.classList.add('effect-particles');
    }
  }, [draft, CIRCLE_COLORS]);

  const handleChange = (key, value) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateCustomization(draft);
  };

  const handleReset = () => {
    resetCustomization();
    setDraft(customization);
  };

  // Funções para descrições
  const getBorderDescription = (styleId) => {
    const descriptions = {
      'static': 'Borda sólida e estática',
      'pulse': 'Borda com efeito pulsante',
      'glow': 'Borda com brilho suave',
      'gradient': 'Borda com gradiente colorido'
    };
    return descriptions[styleId] || '';
  };

  const getBackgroundDescription = (styleId) => {
    const descriptions = {
      'default': 'Fundo padrão do jogo',
      'gradient1': 'Gradiente verde e dourado',
      'gradient2': 'Gradiente azul e roxo',
      'gradient3': 'Gradiente neon vibrante'
    };
    return descriptions[styleId] || '';
  };

  const getEffectDescription = (effectId) => {
    const descriptions = {
      'none': 'Sem efeitos especiais',
      'shine': 'Efeito de brilho suave',
      'particles': 'Partículas flutuantes'
    };
    return descriptions[effectId] || '';
  };

  return (
    <div className="customization-panel">
      <div className="customization-header">
        <FaPalette className="customization-icon" />
        <h3>Personalização</h3>
        <p className="customization-description">Personalize a aparência do seu jogo</p>
      </div>
      
      <div className="customization-section">
        <h4>Cor do Círculo</h4>
        <p className="section-description">Escolha a cor do círculo do personagem</p>
        <div className="color-options">
          {CIRCLE_COLORS.map(color => (
            <button
              key={color.id}
              className={`color-option${draft.circleColor === color.id ? ' active' : ''}`}
              style={{ background: color.value }}
              onClick={() => handleChange('circleColor', color.id)}
              title={`Cor ${color.label}`}
            >
              {draft.circleColor === color.id && <span className="check-icon">✓</span>}
            </button>
          ))}
        </div>
        <div className="current-selection">
          Cor atual: <strong>{CIRCLE_COLORS.find(c => c.id === draft.circleColor)?.label}</strong>
        </div>
      </div>
      
      <div className="customization-section">
        <h4>Estilo de Borda</h4>
        <p className="section-description">Defina o estilo da borda do círculo</p>
        <div className="style-options">
          {BORDER_STYLES.map(style => (
            <button
              key={style.id}
              className={`style-option${draft.borderStyle === style.id ? ' active' : ''}`}
              onClick={() => handleChange('borderStyle', style.id)}
              title={getBorderDescription(style.id)}
            >
              <div className="style-preview border-preview" data-style={style.id}></div>
              <span>{style.label}</span>
            </button>
          ))}
        </div>
        <div className="current-selection">
          Estilo atual: <strong>{BORDER_STYLES.find(s => s.id === draft.borderStyle)?.label}</strong>
        </div>
      </div>
      
      <div className="customization-section">
        <h4>Estilo de Fundo</h4>
        <p className="section-description">Escolha o estilo de fundo do jogo</p>
        <div className="style-options">
          {BG_STYLES.map(style => (
            <button
              key={style.id}
              className={`style-option${draft.backgroundStyle === style.id ? ' active' : ''}`}
              onClick={() => handleChange('backgroundStyle', style.id)}
              title={getBackgroundDescription(style.id)}
            >
              <div className="style-preview bg-preview" data-style={style.id}></div>
              <span>{style.label}</span>
            </button>
          ))}
        </div>
        <div className="current-selection">
          Fundo atual: <strong>{BG_STYLES.find(s => s.id === draft.backgroundStyle)?.label}</strong>
        </div>
      </div>
      
      <div className="customization-section">
        <h4>Efeitos Visuais</h4>
        <p className="section-description">Adicione efeitos especiais ao jogo</p>
        <div className="style-options">
          {EFFECTS.map(effect => (
            <button
              key={effect.id}
              className={`style-option${draft.effects === effect.id ? ' active' : ''}`}
              onClick={() => handleChange('effects', effect.id)}
              title={getEffectDescription(effect.id)}
            >
              <div className="style-preview effect-preview" data-effect={effect.id}></div>
              <span>{effect.label}</span>
            </button>
          ))}
        </div>
        <div className="current-selection">
          Efeito atual: <strong>{EFFECTS.find(e => e.id === draft.effects)?.label}</strong>
        </div>
      </div>
      
      <div className="customization-footer">
        <button className="button secondary" onClick={handleReset}>
          <FaUndo /> Resetar
        </button>
        <button className="button primary" onClick={handleSave}>
          <FaSave /> Salvar
        </button>
      </div>
    </div>
  );
};

const SettingsModal = ({ isOpen, onClose, theme, toggleTheme, customization, updateCustomization, resetCustomization, getCircleColors, getBorderStyles, getBgStyles, getEffects }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('appearance');
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem('nutriaTap_soundEnabled') === 'true');
  const [notificationsEnabled, setNotificationsEnabled] = useState(localStorage.getItem('nutriaTap_notificationsEnabled') === 'true');
  const [showAnimations, setShowAnimations] = useState(localStorage.getItem('nutriaTap_showAnimations') !== 'false');
  

  // Manipuladores de eventos para as configurações
  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('nutriaTap_soundEnabled', newValue);
    // Aqui você pode adicionar lógica para ativar/desativar sons
  };

  const toggleNotifications = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('nutriaTap_notificationsEnabled', newValue);
    // Aqui você pode adicionar lógica para ativar/desativar notificações
  };

  const toggleAnimations = () => {
    const newValue = !showAnimations;
    setShowAnimations(newValue);
    localStorage.setItem('nutriaTap_showAnimations', newValue);
    
    // Aplicar classe CSS ao body para controlar animações
    if (newValue) {
      document.body.classList.remove('no-animations');
    } else {
      document.body.classList.add('no-animations');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-settings" onClick={e => e.stopPropagation()}>
        <div className="header-inner-glow"></div>
        <div className="settings-header">
          <h2 className="settings-title">{t('settingsLabel')}</h2>
          <button className="settings-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="settings-tabs">
          <button 
            className={`settings-tab${activeTab === 'appearance' ? ' active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <FaPalette /> {t('appearance')}
          </button>
          <button 
            className={`settings-tab${activeTab === 'game' ? ' active' : ''}`}
            onClick={() => setActiveTab('game')}
          >
            <FaGamepad /> {t('game')}
          </button>
          <button 
            className={`settings-tab${activeTab === 'about' ? ' active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <FaInfoCircle /> {t('about')}
          </button>
        </div>
        
        <div className="settings-content">
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <div className="theme-setting">
                <h3 className="settings-subtitle">{t('theme')}</h3>
                <div className="theme-buttons">
                  <button 
                    className={`theme-button${theme === 'dark' ? ' active' : ''}`}
                    onClick={() => toggleTheme('dark')}
                  >
                    <FaMoon /> {t('dark')}
                  </button>
                  <button 
                    className={`theme-button${theme === 'light' ? ' active' : ''}`}
                    onClick={() => toggleTheme('light')}
                  >
                    <FaSun /> {t('light')}
                  </button>
                </div>
                
                <div className="premium-themes">
                  <h4>{t('premiumThemes')}</h4>
                  <div className="premium-theme-grid">
                    <button 
                      className={`premium-theme-button${theme === 'neon' ? ' active' : ''}`}
                      onClick={() => toggleTheme('neon')}
                      style={{background: 'var(--gradient-premium-neon)'}}
                    >
                      {t('neon')}
                    </button>
                    <button 
                      className={`premium-theme-button${theme === 'aquatic' ? ' active' : ''}`}
                      onClick={() => toggleTheme('aquatic')}
                      style={{background: 'var(--gradient-premium-aquatic)'}}
                    >
                      {t('aquatic')}
                    </button>
                    <button 
                      className={`premium-theme-button${theme === 'space' ? ' active' : ''}`}
                      onClick={() => toggleTheme('space')}
                      style={{background: 'var(--gradient-premium-space)'}}
                    >
                      {t('space')}
                    </button>
                  </div>
                </div>
              </div>
              
              <CustomizationPanel 
                customization={customization}
                updateCustomization={updateCustomization}
                resetCustomization={resetCustomization}
                getCircleColors={getCircleColors}
                getBorderStyles={getBorderStyles}
                getBgStyles={getBgStyles}
                getEffects={getEffects}
                theme={theme}
              />
            </div>
          )}
          
          {activeTab === 'game' && (
            <div className="settings-section">
              <h3 className="settings-subtitle">{t('gameSettings')}</h3>
              <div className="settings-option">
                <span>{t('soundEffects')}</span>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={soundEnabled}
                    onChange={toggleSound}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="settings-option">
                <span>{t('notifications')}</span>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={notificationsEnabled}
                    onChange={toggleNotifications}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="settings-option">
                <span>{t('showAnimations')}</span>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={showAnimations}
                    onChange={toggleAnimations}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <p className="settings-note">
                <FaInfoCircle /> {t('moreSettingsSoon')}
              </p>
            </div>
          )}
          
          {activeTab === 'about' && (
            <div className="settings-section">
              <h3 className="settings-subtitle">Sobre o Jogo</h3>
              <div className="about-content">
                <p>
                  <strong>Nutria Tap</strong> é um jogo incremental onde você alimenta uma nutria para ganhar pontos.
                </p>
                <p>
                  Versão: 1.0.0<br />
                  Desenvolvido com 💚 por Equipe Nutria
                </p>
                <div className="social-links">
                  <a href="#" className="social-link">
                    <FaTwitter />
                  </a>
                  <a href="#" className="social-link">
                    <FaDiscord />
                  </a>
                  <a href="#" className="social-link">
                    <FaTelegram />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="settings-footer">
          <button className="button secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

const NutriaGame = () => {
  const { gameState, resetGame, theme, setTheme, seasonalEvent, equippedTitle, titles, customization, updateCustomization, resetCustomization, getCircleColors, getBorderStyles, getBgStyles, getEffects, levelUpEffect, prestigeMessage } = useGame();
  const { t, language, changeLanguage } = useLanguage();
  const { user, isLoggedIn, updateUserStats } = useAuth();
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [currentTab, setCurrentTab] = useState('game');
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showEventBanner, setShowEventBanner] = useState(true);
  const [notification, setNotification] = useState(null);

  // Função para mostrar notificação in-game
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Solicitar permissão para notificações
  const requestNotificationPermission = async () => {
    const granted = await notificationService.requestPermission();
    setNotificationPermission(Notification.permission);
    
    if (granted) {
      showNotification('Notificações ativadas! Você receberá avisos sobre recompensas e conquistas.', 'success');
    } else {
      showNotification('Notificações negadas. Você pode ativá-las nas configurações do navegador.', 'warning');
    }
  };

  // Inicializa a integração com o Telegram
  useEffect(() => {
    // Verifica se o script do Telegram Mini App está disponível
    if (window.Telegram && window.Telegram.WebApp) {
      // Inicializa o Mini App
      window.Telegram.WebApp.ready();
      
      // Expande o app para o tamanho completo
      window.Telegram.WebApp.expand();
      
      // Define o título e tema principal de acordo com o tema do Telegram
      document.documentElement.style.setProperty('--background', window.Telegram.WebApp.backgroundColor || '#f4f6f8');
      
      // Habilita os botões de voltar se necessário
      window.Telegram.WebApp.BackButton.isVisible = false;
    }
  }, []);

  // Aplicar tema ao documento
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Aplicar configurações de personalização salvas
  useEffect(() => {
    if (customization) {
      const CIRCLE_COLORS = getCircleColors(t);
      
      // Aplicar cor do círculo
      document.documentElement.style.setProperty('--circle-bg', CIRCLE_COLORS.find(c => c.id === customization.circleColor)?.value || '#2ecc71');
      
      // Aplicar estilo de borda
      document.documentElement.style.setProperty('--circle-border', customization.borderStyle === 'pulse' ? '#f39c12' : customization.borderStyle === 'glow' ? '#ffe066' : customization.borderStyle === 'gradient' ? 'linear-gradient(90deg,#2ecc71,#f39c12)' : '#2ecc71');
      
      // Aplicar fundo customizado
      let bg = 'var(--background)';
      if (customization.backgroundStyle === 'gradient1') bg = 'linear-gradient(135deg, rgba(46, 204, 113, 0.1), rgba(243, 156, 18, 0.1))';
      if (customization.backgroundStyle === 'gradient2') bg = 'linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(155, 89, 182, 0.1))';
      if (customization.backgroundStyle === 'gradient3') bg = 'linear-gradient(135deg, rgba(0, 255, 170, 0.1), rgba(255, 0, 128, 0.1))';
      document.documentElement.style.setProperty('--custom-bg', bg);
      
      // Aplicar efeitos visuais
      document.body.classList.remove('effect-shine', 'effect-particles');
      if (customization.effects === 'shine') {
        document.body.classList.add('effect-shine');
      } else if (customization.effects === 'particles') {
        document.body.classList.add('effect-particles');
      }
    }
  }, [customization, getCircleColors, t]);

  // Sincronizar estatísticas do usuário com o jogo (com debounce)
  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const timeoutId = setTimeout(async () => {
      // Atualizar stats locais
      updateUserStats({
        totalCoins: gameState.coins,
        totalClicks: gameState.totalClicks,
        maxStreak: gameState.maxStreak,
        level: gameState.level,
        achievements: gameState.achievements.length,
        prestigeLevel: gameState.prestige.level
      });

      // Sincronizar com backend
      try {
        await syncService.syncGameData();
      } catch (error) {
        console.error('Erro na sincronização automática:', error);
      }
    }, 1000); // Debounce de 1 segundo

    return () => clearTimeout(timeoutId);
  }, [gameState.coins, gameState.totalClicks, gameState.maxStreak, gameState.level, gameState.achievements.length, gameState.prestige.level, isLoggedIn, user, updateUserStats]);

  // Inicializar sincronização automática
  useEffect(() => {
    if (isLoggedIn && user) {
      // Iniciar sincronização automática a cada 30 segundos
      syncService.startAutoSync(30000);
      
      return () => {
        syncService.stopAutoSync();
      };
    }
  }, [isLoggedIn, user]);

  return (
    <div className={`container theme-${theme}`}>
      <div className="background-particles" />
      <ParticleSystem active={levelUpEffect} type="levelup" intensity={1.5} />
      
      {/* Mensagem de Prestígio Premium */}
      {prestigeMessage && (
        <div className="prestige-modal-overlay">
          <div className="prestige-modal">
            <div className="prestige-modal-header">
              <div className="prestige-icon">
                <FaStar />
              </div>
              <h2 className="prestige-title">Prestígio Realizado!</h2>
            </div>
            <div className="prestige-modal-content">
              <p className="prestige-message-text">{prestigeMessage}</p>
              <div className="prestige-effects">
                <div className="prestige-effect">
                  <span className="effect-icon">⚡</span>
                  <span className="effect-text">Multiplicadores Aplicados</span>
                </div>
                <div className="prestige-effect">
                  <span className="effect-icon">🎯</span>
                  <span className="effect-text">Progresso Resetado</span>
                </div>
                <div className="prestige-effect">
                  <span className="effect-icon">🚀</span>
                  <span className="effect-text">Novo Começo</span>
                </div>
              </div>
            </div>
            <div className="prestige-modal-footer">
              <button 
                className="prestige-close-btn"
                onClick={() => setPrestigeMessage(null)}
              >
                <FaCheck /> Continuar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Notificação In-Game */}
      {notification && (
        <div className="game-notification">
          <div className={`notification-content ${notification.type}`}>
            <div className="notification-icon">
              {notification.type === 'success' ? '✅' : 'ℹ️'}
            </div>
            <div className="notification-message">
              {notification.message}
            </div>
          </div>
        </div>
      )}
      
      {seasonalEvent && showEventBanner && (
        <div className="event-banner">
          <div className="event-banner-content">
            <span className="event-emoji" role="img" aria-label={t('event')}>{seasonalEvent.banner}</span>
            <div className="event-info">
              <h3 className="event-title">{seasonalEvent.name}</h3>
              <p className="event-desc">{seasonalEvent.desc}</p>
          </div>
            <button 
              className="event-close" 
              onClick={() => setShowEventBanner(false)}
              aria-label={t('closeEvent')}
            >
              <FaTimes />
            </button>
          </div>
          <div className="event-rewards">
            <span className="event-rewards-label">Recompensas:</span>
            <div className="event-rewards-list">
              {seasonalEvent.rewards.map(r => (
                <span key={r} className="event-reward-item">
                  {r.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="premium-header">
        <div className="header-background"></div>
        
        {/* PRIMEIRA LINHA: Logo + Energia + Botões */}
        <div className="header-top-row">
          <div className="header-logo">
            <span className="logo-nutria">NUTRIA</span>
            <span className="logo-tap">TAP</span>
        </div>
          
          <div className="header-energy">
            <div className={`energy-display ${gameState.energy?.current <= 20 ? 'energy-low' : ''}`}>
              <div className="energy-icon">
                ⚡
              </div>
              <div className="energy-info">
                <span className="energy-amount">{gameState.energy?.current || 100}/{gameState.energy?.max || 100}</span>
                <span className="energy-label">ENERGIA</span>
              </div>
              <div className="energy-glow"></div>
            </div>
          </div>
          
          <div className="header-actions">
            {notificationPermission !== 'granted' && (
              <button
                className="notification-btn-premium"
                aria-label="Ativar Notificações"
                onClick={requestNotificationPermission}
                title="Ativar notificações para recompensas e conquistas"
              >
                <div className="btn-icon">
                  <FaBell />
                </div>
                <div className="btn-glow"></div>
              </button>
            )}
            <button
              className="language-btn-premium"
              aria-label={t('language')}
              onClick={() => changeLanguage(language === 'pt' ? 'en' : 'pt')}
              title={`${t('language')}: ${language === 'pt' ? '🇺🇸 English' : '🇧🇷 Português'}`}
            >
              <div className="btn-icon">
                {language === 'pt' ? '🇺🇸' : '🇧🇷'}
          </div>
              <div className="btn-glow"></div>
            </button>
          <button
              className="settings-btn-premium"
              aria-label={t('settingsLabel')}
            onClick={() => setShowSettings(true)}
          >
              <div className="btn-icon">
            <FaCog />
              </div>
              <div className="btn-glow"></div>
          </button>
          </div>
        </div>

        {/* SEGUNDA LINHA: Título + Prestígio + Moedas */}
        <div className="header-bottom-row">
          {equippedTitle && (
            <div className="player-title-badge">
              <div className="title-icon">👑</div>
              <span className="title-text">{titles.find(t => t.id === equippedTitle)?.name || 'Iniciante'}</span>
            </div>
          )}
          
          {gameState.prestige.level > 0 && (
            <div className="prestige-badge-premium">
              <div className="prestige-icon">
                <FaStar />
              </div>
              <div className="prestige-info">
                <span className="prestige-label">{t('prestige')}</span>
                <span className="prestige-level">{gameState.prestige.level}</span>
                <span className="prestige-multiplier">({gameState.prestige.multipliers.coins.toFixed(1)}x)</span>
              </div>
            </div>
          )}
          
          <div className="currency-display">
            <div className="currency-icon">
              <FaCoins />
            </div>
            <div className="currency-info">
              <span className="currency-amount">{gameState.coins.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="currency-symbol">pNTR</span>
            </div>
            <div className="currency-glow"></div>
          </div>
        </div>
        </div>
      
      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          theme={theme}
          toggleTheme={setTheme}
          customization={customization}
          updateCustomization={updateCustomization}
          resetCustomization={resetCustomization}
          getCircleColors={getCircleColors}
          getBorderStyles={getBorderStyles}
          getBgStyles={getBgStyles}
          getEffects={getEffects}
        />
      )}
      
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      
      <EnhancedNavigation currentTab={currentTab} setCurrentTab={setCurrentTab} />
      
      <div className="tab-content">
      {currentTab === 'game' && (
        <>
          <NutriaClicker />
            <ActiveBonuses />
          <UpgradesTabs />
          <div className="buttons-row">
            {!showConfirmReset ? (
              <button
                className="button reset-button"
                onClick={() => setShowConfirmReset(true)}
              >
                  <FaRedo /> {t('resetProgress')}
              </button>
            ) : (
              <>
                <button
                  className="button reset-button confirm"
                  onClick={() => {
                    resetGame();
                    setShowConfirmReset(false);
                  }}
                >
                    <FaCheck /> {t('confirmReset')}
                </button>
                <button
                  className="button cancel-button"
                  onClick={() => setShowConfirmReset(false)}
                >
                    <FaTimes /> {t('cancel')}
                </button>
              </>
            )}
          </div>
        </>
      )}
      
        {currentTab === 'dashboard' && <Dashboard />}
      {currentTab === 'stats' && <Stats />}
        {currentTab === 'rewards' && <EnhancedRewards />}
      {currentTab === 'more' && <MoreMenu onSelect={setCurrentTab} />}
      {currentTab === 'referral' && <Referral />}
      {currentTab === 'badges' && <Badges />}
      {currentTab === 'skins' && <Skins />}
      {currentTab === 'titles' && <Titles />}
        {currentTab === 'missions' && <Missions showNotification={showNotification} />}
      {currentTab === 'airdrop' && <Airdrop />}
      {currentTab === 'ranking' && <Ranking />}
      {currentTab === 'achievements' && <Achievements />}
      {currentTab === 'minigames' && <MiniGames />}
        {currentTab === 'collectibles' && <Collectibles />}
        {currentTab === 'events' && <EventsTab />}
        {currentTab === 'guild' && <GuildSystem />}
      </div>
      {currentTab === 'settings' && (
        <div className="card">
          <div className="card-header">
            <FaCog className="card-icon" />
            <h3 className="card-title">{t('settings')}</h3>
          </div>
          <div className="settings-section">
            <h4 className="settings-subtitle">{t('theme')}</h4>
            <div className="theme-buttons">
              <button 
                className={`theme-button${theme === 'dark' ? ' active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <FaMoon /> {t('dark')}
              </button>
              <button 
                className={`theme-button${theme === 'light' ? ' active' : ''}`}
                onClick={() => setTheme('light')}
              >
                <FaSun /> {t('light')}
              </button>
            </div>
            
            <div className="premium-themes">
              <h4>{t('premiumThemes')}</h4>
              <div className="premium-theme-grid">
                <button 
                  className={`premium-theme-button${theme === 'neon' ? ' active' : ''}`}
                  onClick={() => setTheme('neon')}
                  style={{background: 'var(--gradient-premium-neon)'}}
                >
                  {t('neon')}
                </button>
                <button 
                  className={`premium-theme-button${theme === 'aquatic' ? ' active' : ''}`}
                  onClick={() => setTheme('aquatic')}
                  style={{background: 'var(--gradient-premium-aquatic)'}}
                >
                  {t('aquatic')}
                </button>
                <button 
                  className={`premium-theme-button${theme === 'space' ? ' active' : ''}`}
                  onClick={() => setTheme('space')}
                  style={{background: 'var(--gradient-premium-space)'}}
                >
                  {t('space')}
                </button>
              </div>
            </div>
          </div>
          <div className="settings-section">
            <h4 className="settings-subtitle">{t('language')}</h4>
            <div className="language-buttons">
              <button 
                className={`language-button${language === 'pt' ? ' active' : ''}`}
                onClick={() => changeLanguage('pt')}
              >
                🇧🇷 {t('portuguese')}
              </button>
              <button 
                className={`language-button${language === 'en' ? ' active' : ''}`}
                onClick={() => changeLanguage('en')}
              >
                🇺🇸 {t('english')}
              </button>
            </div>
          </div>
          <div className="settings-footer">
            <button className="button secondary" onClick={() => setCurrentTab('more')}>
              <FaArrowLeft /> {t('back')}
            </button>
          </div>
        </div>
      )}
      {currentTab === 'help' && <HelpModal onClose={() => setCurrentTab('more')} />}
      
      <Onboarding onComplete={() => console.log('Onboarding completed')} />
      
        {/* Sistema de Notificações */}
        <NotificationContainer />

    </div>
  );
};

export default NutriaGame;