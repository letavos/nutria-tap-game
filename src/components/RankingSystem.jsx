import { useState, useEffect } from 'react';
import { FaTrophy, FaMedal, FaCrown, FaCoins, FaChartLine, FaFire, FaStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const RankingSystem = ({ isOpen, onClose }) => {
  const { user, isLoggedIn, getRanking } = useAuth();
  const { t } = useLanguage();
  const [ranking, setRanking] = useState([]);
  const [sortBy, setSortBy] = useState('totalCoins');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRanking();
    }
  }, [isOpen, sortBy]);

  const loadRanking = () => {
    setLoading(true);
    try {
      const rankingData = getRanking(sortBy, 100);
      setRanking(rankingData);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaCrown className="rank-icon gold" />;
    if (rank === 2) return <FaMedal className="rank-icon silver" />;
    if (rank === 3) return <FaMedal className="rank-icon bronze" />;
    return <span className="rank-number">{rank}</span>;
  };

  const getSortIcon = (type) => {
    switch (type) {
      case 'totalCoins':
        return <FaCoins />;
      case 'level':
        return <FaChartLine />;
      case 'totalClicks':
        return <FaChartLine />;
      case 'maxStreak':
        return <FaFire />;
      case 'prestigeLevel':
        return <FaStar />;
      default:
        return <FaCoins />;
    }
  };

  const formatValue = (value, type) => {
    switch (type) {
      case 'totalCoins':
      case 'totalClicks':
        return value.toLocaleString();
      case 'level':
      case 'maxStreak':
      case 'achievements':
      case 'prestigeLevel':
        return value;
      default:
        return value;
    }
  };

  const getSortOptions = () => [
    { value: 'totalCoins', label: t('totalCoins'), icon: <FaCoins /> },
    { value: 'level', label: t('level'), icon: <FaChartLine /> },
    { value: 'totalClicks', label: t('totalClicks'), icon: <FaChartLine /> },
    { value: 'maxStreak', label: t('maxStreak'), icon: <FaFire /> },
    { value: 'prestigeLevel', label: t('prestigeLevel'), icon: <FaStar /> }
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ranking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FaTrophy className="modal-icon" />
            {t('ranking')}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Filtros de ordenação */}
          <div className="ranking-filters">
            <div className="sort-options">
              {getSortOptions().map(option => (
                <button
                  key={option.value}
                  className={`sort-option ${sortBy === option.value ? 'active' : ''}`}
                  onClick={() => setSortBy(option.value)}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Posição do usuário atual */}
          {isLoggedIn && user && (
            <div className="user-rank-card">
              <div className="user-rank-info">
                <div className="user-rank-position">
                  {getRankIcon(getUserRank(sortBy) || 'N/A')}
                  <span className="user-rank-text">
                    {t('yourPosition')}: #{getUserRank(sortBy) || 'N/A'}
                  </span>
                </div>
                <div className="user-rank-stats">
                  <span className="user-rank-value">
                    {formatValue(user.stats[sortBy] || 0, sortBy)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Lista de ranking */}
          <div className="ranking-list">
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>{t('loading')}...</p>
              </div>
            ) : ranking.length === 0 ? (
              <div className="empty-ranking">
                <FaTrophy className="empty-icon" />
                <p>{t('noRankingData')}</p>
              </div>
            ) : (
              <div className="ranking-table">
                <div className="ranking-header">
                  <div className="rank-col">{t('rank')}</div>
                  <div className="username-col">{t('username')}</div>
                  <div className="value-col">{getSortOptions().find(opt => opt.value === sortBy)?.label}</div>
                  <div className="level-col">{t('level')}</div>
                </div>
                
                {ranking.map((player, index) => (
                  <div 
                    key={player.id} 
                    className={`ranking-row ${isLoggedIn && user && player.id === user.id ? 'current-user' : ''}`}
                  >
                    <div className="rank-col">
                      {getRankIcon(player.rank)}
                    </div>
                    <div className="username-col">
                      <span className="username">{player.username}</span>
                      {isLoggedIn && user && player.id === user.id && (
                        <span className="you-badge">({t('you')})</span>
                      )}
                    </div>
                    <div className="value-col">
                      <span className="value">
                        {formatValue(player.stats[sortBy] || 0, sortBy)}
                      </span>
                    </div>
                    <div className="level-col">
                      <span className="level">Lv.{player.stats.level || 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informações adicionais */}
          <div className="ranking-info">
            <div className="info-item">
              <FaTrophy className="info-icon" />
              <span>{t('rankingUpdated')}</span>
            </div>
            <div className="info-item">
              <FaChartLine className="info-icon" />
              <span>{t('totalPlayers')}: {ranking.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingSystem;
