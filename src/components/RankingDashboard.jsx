import { useState, useEffect } from 'react';
import { FaTrophy, FaMedal, FaCrown, FaCoins, FaChartLine, FaFire, FaStar, FaUsers } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const RankingDashboard = () => {
  const { user, isLoggedIn, getRanking } = useAuth();
  const { t } = useLanguage();
  const [ranking, setRanking] = useState([]);
  const [sortBy, setSortBy] = useState('totalCoins');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRanking();
  }, [sortBy]);

  const loadRanking = async () => {
    setLoading(true);
    try {
      console.log('Carregando ranking...');
      const result = await getRanking(100);
      console.log('Resultado do ranking:', result);
      
      if (result.success && result.data) {
        setRanking(result.data);
        console.log('Ranking carregado:', result.data);
      } else {
        console.error('Erro ao carregar ranking:', result.error);
        setRanking([]);
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
      setRanking([]);
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

  // Função para obter posição do usuário no ranking
  const getUserRank = (sortBy) => {
    if (!user || !ranking || !Array.isArray(ranking) || ranking.length === 0) return null;
    
    const userIndex = ranking.findIndex(item => 
      item && (item.user_id === user.id || item.username === user.user_metadata?.username)
    );
    
    return userIndex >= 0 ? userIndex + 1 : null;
  };

  // Função para obter estatísticas do usuário
  const getUserStats = (sortBy) => {
    if (!user || !ranking || !Array.isArray(ranking) || ranking.length === 0) return 0;
    
    const userData = ranking.find(item => 
      item && (item.user_id === user.id || item.username === user.user_metadata?.username)
    );
    
    if (!userData) return 0;
    
    switch (sortBy) {
      case 'totalCoins':
        return userData.total_coins || 0;
      case 'level':
        return userData.level || 0;
      case 'totalClicks':
        return userData.total_clicks || 0;
      case 'maxStreak':
        return userData.max_streak || userData.streak || 0;
      case 'prestigeLevel':
        return userData.prestige_level || 0;
      default:
        return 0;
    }
  };

  // Função para obter valor do player baseado no sortBy
  const getPlayerValue = (player, sortBy) => {
    if (!player) return 0;
    
    switch (sortBy) {
      case 'totalCoins':
        return player.total_coins || 0;
      case 'level':
        return player.level || 0;
      case 'totalClicks':
        return player.total_clicks || 0;
      case 'maxStreak':
        return player.max_streak || player.streak || 0;
      case 'prestigeLevel':
        return player.prestige_level || 0;
      default:
        return 0;
    }
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
    if (value === null || value === undefined || isNaN(value)) {
      return 0;
    }
    
    switch (type) {
      case 'totalCoins':
      case 'totalClicks':
        return Number(value).toLocaleString();
      case 'level':
      case 'maxStreak':
      case 'achievements':
      case 'prestigeLevel':
        return Number(value);
      default:
        return Number(value) || 0;
    }
  };

  const getSortOptions = () => [
    { value: 'totalCoins', label: t('totalCoins'), icon: <FaCoins /> },
    { value: 'level', label: t('level'), icon: <FaChartLine /> },
    { value: 'totalClicks', label: t('totalClicks'), icon: <FaChartLine /> },
    { value: 'maxStreak', label: t('maxStreak'), icon: <FaFire /> },
    { value: 'prestigeLevel', label: t('prestigeLevel'), icon: <FaStar /> }
  ];

  // Verificação de segurança
  if (loading) {
    return (
      <div className="ranking-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando ranking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ranking-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <FaTrophy className="title-icon" />
            <h1>{t('ranking')}</h1>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Filtros de ordenação */}
        <div className="ranking-filters">
          <h3>{t('sortBy')}:</h3>
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
          <div className="user-rank-section">
            <h3>{t('yourPosition')}</h3>
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
                    {formatValue(getUserStats(sortBy) || 0, sortBy)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de ranking */}
        <div className="ranking-section">
          <h3>{t('topPlayers')}</h3>
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
                
                {ranking && Array.isArray(ranking) && ranking.map((player, index) => {
                  if (!player) return null;
                  
                  return (
                    <div 
                      key={player.id || player.user_id || index} 
                      className={`ranking-row ${isLoggedIn && user && (player.id === user.id || player.user_id === user.id) ? 'current-user' : ''}`}
                    >
                      <div className="rank-col">
                        {getRankIcon(index + 1)}
                      </div>
                      <div className="username-col">
                        <span className="username">{player.username || 'Usuário'}</span>
                        {isLoggedIn && user && (player.id === user.id || player.user_id === user.id) && (
                          <span className="you-badge">({t('you')})</span>
                        )}
                      </div>
                      <div className="value-col">
                        <span className="value">
                          {formatValue(getPlayerValue(player, sortBy), sortBy)}
                        </span>
                      </div>
                      <div className="level-col">
                        <span className="level">Lv.{player.level || 1}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="ranking-info">
          <div className="info-cards">
            <div className="info-card">
              <FaTrophy className="info-icon" />
              <div className="info-content">
                <span className="info-label">{t('rankingUpdated')}</span>
              </div>
            </div>
            <div className="info-card">
              <FaUsers className="info-icon" />
              <div className="info-content">
                <span className="info-label">{t('totalPlayers')}: {ranking.length}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RankingDashboard;
