import { useState, useEffect, useCallback, useRef } from 'react';
import { FaTrophy, FaMedal, FaCrown, FaCoins, FaChartLine, FaFire, FaStar, FaUsers } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const RankingDashboard = () => {
  const { user, isLoggedIn, getRanking } = useAuth();
  const { t } = useLanguage();
  const [ranking, setRanking] = useState([]);
  const [sortBy, setSortBy] = useState('overall');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Removidos refs desnecessários que causavam problemas

  // Função interna para carregar ranking (simplificada)
  const loadRankingInternal = useCallback(async () => {
    console.log('🔄 [RankingDashboard] Iniciando loadRanking...', { sortBy, isLoggedIn, userId: user?.id });
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 [RankingDashboard] Chamando getRanking...');
      
      const result = await getRanking(100);
      console.log('📡 [RankingDashboard] getRanking retornou:', typeof result, result);
      
      // Verificar se result é um array direto ou um objeto com propriedade data
      let rankingData = null;
      if (Array.isArray(result)) {
        console.log('✅ [RankingDashboard] Resultado é array direto');
        rankingData = result;
      } else if (result && result.data && Array.isArray(result.data)) {
        console.log('✅ [RankingDashboard] Resultado tem propriedade data (array)');
        rankingData = result.data;
      } else if (result && result.success && result.data && Array.isArray(result.data)) {
        console.log('✅ [RankingDashboard] Resultado tem success e data (array)');
        rankingData = result.data;
      } else {
        console.log('❌ [RankingDashboard] Formato de resultado não reconhecido');
      }

      if (rankingData && rankingData.length > 0) {
        console.log('✅ [RankingDashboard] Ranking carregado com sucesso:', rankingData.length, 'itens');
        setRanking(rankingData);
        setError(null);
      } else {
        console.error('❌ [RankingDashboard] Erro ao carregar ranking: dados inválidos', result);
        setError('Erro ao carregar ranking');
        setRanking([]);
      }
    } catch (error) {
      console.error('💥 [RankingDashboard] Exceção ao carregar ranking:', error);
      setError(error.message || 'Erro inesperado ao carregar ranking');
      setRanking([]);
    } finally {
      console.log('🏁 [RankingDashboard] Finalizando loadRanking, setLoading(false)');
      setLoading(false);
    }
  }, [getRanking, sortBy, isLoggedIn, user?.id]);

  // Função loadRanking simplificada
  const loadRanking = useCallback(() => {
    loadRankingInternal();
  }, [loadRankingInternal]);

  // Removido useEffect de inicialização desnecessário

  // Carregar ranking quando usuário estiver logado
  useEffect(() => {
    console.log('🎯 [RankingDashboard] useEffect executado', { sortBy, isLoggedIn, userId: user?.id });
    
    // Só carregar se estiver logado e tiver usuário
    if (isLoggedIn && user?.id) {
      loadRanking();
    } else {
      console.log('⏸️ [RankingDashboard] Usuário não logado, pulando loadRanking');
      setRanking([]);
      setLoading(false);
      setError(null);
    }
  }, [isLoggedIn, user?.id]);

  // Função para recarregar ranking manualmente
  const handleRefresh = useCallback(() => {
    console.log('🔄 [RankingDashboard] Refresh manual solicitado');
    loadRanking();
  }, [loadRanking]);

  // Função para mudar ordenação
  const handleSortChange = useCallback((newSortBy) => {
    console.log('🔄 [RankingDashboard] Mudando ordenação para:', newSortBy);
    setSortBy(newSortBy);
    // Não recarregar automaticamente, apenas mudar a ordenação local
  }, []);

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
    { value: 'overall', label: t('overallScore') || 'Overall Score', icon: <FaTrophy /> },
    { value: 'totalCoins', label: t('totalCoins'), icon: <FaCoins /> },
    { value: 'level', label: t('level'), icon: <FaChartLine /> },
    { value: 'totalClicks', label: t('totalClicks'), icon: <FaChartLine /> },
    { value: 'maxStreak', label: t('maxStreak'), icon: <FaFire /> },
    { value: 'prestigeLevel', label: t('prestigeLevel'), icon: <FaStar /> }
  ];

  // Pontuação geral ponderada
  const getOverallScore = (player) => {
    if (!player) return 0;
    const coins = Number(player.total_coins || 0);
    const level = Number(player.level || 0);
    const clicks = Number(player.total_clicks || 0);
    const streak = Number(player.max_streak || player.streak || 0);
    const prestige = Number(player.prestige_level || 0);
    // Pesos ajustáveis
    const score = coins * 1 + level * 1000 + clicks * 2 + streak * 500 + prestige * 5000;
    return score;
  };

  const getValueForSort = (player) => {
    if (sortBy === 'overall') return getOverallScore(player);
    return getPlayerValue(player, sortBy);
  };

  const sortedRanking = Array.isArray(ranking)
    ? [...ranking].sort((a, b) => (getValueForSort(b) - getValueForSort(a)))
    : [];

  // Verificação de segurança
  if (loading) {
    return (
      <div className="ranking-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('loading')}</p>
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
          <div className="filters-header">
            <h3>{t('sortBy')}:</h3>
            <button 
              className="refresh-button"
              onClick={handleRefresh}
              disabled={loading}
              title={t('refresh') || 'Atualizar'}
            >
              🔄
            </button>
          </div>
          <div className="sort-options">
            {getSortOptions().map(option => (
              <button
                key={option.value}
                className={`sort-option ${sortBy === option.value ? 'active' : ''}`}
                onClick={() => handleSortChange(option.value)}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Exibição de erro */}
        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
            <button onClick={handleRefresh} className="retry-button">
              Tentar novamente
            </button>
          </div>
        )}

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
                
                {sortedRanking && Array.isArray(sortedRanking) && sortedRanking.map((player, index) => {
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
                        <span className="username">{player.username || t('username')}</span>
                        {isLoggedIn && user && (player.id === user.id || player.user_id === user.id) && (
                          <span className="you-badge">({t('you')})</span>
                        )}
                      </div>
                      <div className="value-col">
                        <span className="value">
                          {formatValue(getValueForSort(player), sortBy)}
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
