import { FaStar, FaBolt, FaShieldAlt, FaSmile, FaCoins, FaHandPointer, FaTrophy, FaChartLine } from 'react-icons/fa';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';

const Stats = () => {
  const { gameState, levelUpEffect, theme } = useGame();
  const { t } = useLanguage();
  const { stats, level, experience, experienceToNextLevel, coins, totalClicks, maxStreak } = gameState;
  
  // Calcula o máximo das estatísticas (para a visualização gráfica)
  const maxStat = Math.max(stats.strength, stats.agility, stats.defense, stats.charisma) * 1.2;
  
  // Normaliza as estatísticas para o gráfico de barras
  const normalizeValue = value => (value / maxStat) * 100;
  
  // Barra de XP
  const xpPercent = Math.min(100, (experience / experienceToNextLevel) * 100);
  
  // Calcular estatísticas adicionais
  const coinsPerClick = (totalClicks > 0) ? (coins / totalClicks).toFixed(2) : "0.00";
  const nextLevelXP = experienceToNextLevel - experience;

  return (
    <div className="stats-container">
      <div className="stats card">
        <div className="stats-hero-section">
          <div className="stats-hero-left">
            <div className="stats-level-badge">
              <FaTrophy className="stats-level-icon" />
              <span>{level}</span>
            </div>
          </div>
          <div className="stats-hero-right">
            <h3 className="stats-hero-title">{t('level')} {level}</h3>
            <div className={`xp-bar-outer${levelUpEffect ? ' xp-bar-glow' : ''}`}>
              <div
                className="xp-bar-inner"
                style={{ width: `${xpPercent}%` }}
              ></div>
            </div>
            <div className="xp-stats">
              <div>XP: <span className="stat-value">{experience}</span> / {experienceToNextLevel}</div>
              <div>{t('nextLevel')} <span className="stat-value">{nextLevelXP} XP</span></div>
            </div>
            {levelUpEffect && (
              <div className="levelup-badge">{t('levelUp')}</div>
            )}
          </div>
        </div>

        <div className="stats-grid-container">
          {/* Seção de Estatísticas de Cliques */}
          <div className="stats-card">
            <div className="stats-card-title">
              <FaHandPointer className="stats-card-icon" />
              <h3 className="stats-card-title-text">{t('clickStats')}</h3>
            </div>
            
            <div className="stats-sub-card">
              <div className="stats-sub-label">{t('totalClicksLabel')}</div>
              <div className="stats-sub-value">{totalClicks.toLocaleString()}</div>
            </div>
            <div className="stats-sub-card">
              <div className="stats-sub-label">{t('maxStreakLabel')}</div>
              <div className="stats-sub-value">{maxStreak}</div>
            </div>
            <div className="stats-sub-card">
              <div className="stats-sub-label">{t('coinsPerClick')}</div>
              <div className="stats-sub-value">{coinsPerClick}</div>
            </div>
          </div>
          
          {/* Seção de Economia */}
          <div className="stats-card">
            <div className="stats-card-title">
              <FaCoins className="stats-card-icon" />
              <h3 className="stats-card-title-text">{t('economy')}</h3>
            </div>
            
            <div className="stats-sub-card">
              <div className="stats-sub-label">{t('totalCoins')}</div>
              <div className="stats-sub-value">{coins.toLocaleString()} pNTR</div>
            </div>
            <div className="stats-sub-card">
              <div className="stats-sub-label">{t('clickValue')}</div>
              <div className="stats-sub-value">{gameState.clickValue} pNTR</div>
            </div>
          </div>
        </div>
        
        {/* Seção de Atributos - Centralizada */}
        <div className="stats-section attributes-section centered-section">
          <div className="stats-section-header">
            <FaChartLine className="stats-section-icon" />
            <h3 className="stats-section-title">{t('characterStats')}</h3>
          </div>
          
          <div className="attr-row">
            <div className="attr">
              <i><FaStar /></i>
              <span>{stats.strength}</span>
              <div className="attr-label">{t('strength')}</div>
            </div>
            <div className="attr">
              <i><FaBolt /></i>
              <span>{stats.agility}</span>
              <div className="attr-label">{t('agility')}</div>
            </div>
            <div className="attr">
              <i><FaShieldAlt /></i>
              <span>{stats.defense}</span>
              <div className="attr-label">{t('defense')}</div>
            </div>
            <div className="attr">
              <i><FaSmile /></i>
              <span>{stats.charisma}</span>
              <div className="attr-label">{t('charisma')}</div>
            </div>
          </div>
          
          <div className="xp-info-card">
            <h4 className="xp-info-title">{t('howToGainXP')}</h4>
            <p className="xp-info-text">{t('clickForXP')}</p>
            <p className="xp-info-text">{t('levelUpStats')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats; 