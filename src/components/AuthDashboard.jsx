// Dashboard de Autenticação com Supabase
import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaWallet, FaTrophy, FaChartLine, FaEdit, FaSave, FaTimes, FaSignInAlt, FaSignOutAlt, FaUserPlus, FaLock, FaEye, FaEyeSlash, FaSpinner, FaUsers, FaCopy } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../config/supabase';

const AuthDashboard = () => {
  const { 
    user, 
    profile, 
    isLoggedIn, 
    signUp, 
    signIn, 
    signOut, 
    updateProfile, 
    updateUserStats, 
    getRanking, 
    loading, 
    error,
    clearError 
  } = useAuth();
  
  const { t } = useLanguage();
  const [mode, setMode] = useState('view'); // 'view', 'register', 'login', 'edit'
  const [showPassword, setShowPassword] = useState(false);
  const [gameStats, setGameStats] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    walletAddress: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [userRank, setUserRank] = useState(null);

  // Carregar ranking do usuário
  useEffect(() => {
    if (isLoggedIn && user) {
      loadUserRank();
      loadGameStats();
    }
  }, [isLoggedIn, user]);

  const loadUserRank = async () => {
    try {
      const result = await getRanking(100);
      if (result.success && result.data) {
        const userRankData = result.data.find(rank => rank.id === user.id);
        setUserRank(userRankData);
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    }
  };

  // Carregar estatísticas do jogo
  const loadGameStats = async () => {
    if (!isLoggedIn) return;
    
    try {
      // Buscar estatísticas do usuário no Supabase
      const { data, error } = await supabase
        .from('game_stats')
        .select(`
          total_coins,
          level,
          total_clicks,
          streak,
          max_streak,
          prestige_level,
          referrals
        `)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Erro ao carregar estatísticas:', error);
        return;
      }
      
      if (data) {
        console.log('Dados do jogo carregados:', data);
        
        // Buscar referral_id do usuário
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('referral_id, username, email')
          .eq('id', user.id)
          .single();
        
        console.log('Dados do usuário (referral_id):', userData);
        console.log('Erro ao buscar usuário:', userError);
        
        // Buscar conquistas separadamente
        const { count: achievementsCount } = await supabase
          .from('user_achievements')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        console.log('Total de conquistas:', achievementsCount);
        
        // Se não tem referral_id, gerar um
        let referralId = userData?.referral_id;
        if (!referralId) {
          console.log('Usuário não tem referral_id, gerando...');
          // Gerar um código temporário até o banco ser atualizado
          referralId = Math.random().toString(36).substring(2, 10).toUpperCase();
          console.log('Código temporário gerado:', referralId);
        }
        
        setGameStats({
          totalCoins: data.total_coins || 0,
          level: data.level || 1,
          totalClicks: data.total_clicks || 0,
          maxStreak: data.max_streak || data.streak || 0,
          achievements: achievementsCount || 0,
          prestigeLevel: data.prestige_level || 0,
          referralId: referralId || '',
          referrals: data.referrals || []
        });
        
        console.log('GameStats final:', {
          totalCoins: data.total_coins || 0,
          level: data.level || 1,
          totalClicks: data.total_clicks || 0,
          maxStreak: data.max_streak || data.streak || 0,
          achievements: achievementsCount || 0,
          prestigeLevel: data.prestige_level || 0,
          referralId: userData?.referral_id || '',
          referrals: data.referrals || []
        });
      } else {
        console.log('Nenhum dado encontrado, usando valores padrão');
        
        // Buscar referral_id do usuário mesmo sem dados de jogo
        const { data: userData } = await supabase
          .from('users')
          .select('referral_id, username, email')
          .eq('id', user.id)
          .single();
        
        // Buscar conquistas separadamente
        const { count: achievementsCount } = await supabase
          .from('user_achievements')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        console.log('Total de conquistas (sem dados de jogo):', achievementsCount);
        
        // Se não tem referral_id, gerar um
        let referralId = userData?.referral_id;
        if (!referralId) {
          console.log('Usuário não tem referral_id, gerando...');
          // Gerar um código temporário até o banco ser atualizado
          referralId = Math.random().toString(36).substring(2, 10).toUpperCase();
          console.log('Código temporário gerado:', referralId);
        }
        
        setGameStats({
          totalCoins: 0,
          level: 1,
          totalClicks: 0,
          maxStreak: 0,
          achievements: 0,
          prestigeLevel: 0,
          referralId: referralId || '',
          referrals: []
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Limpar erros quando mudar de modo
  useEffect(() => {
    clearError();
    setFormErrors({});
  }, [mode, clearError]);

  // Atualizar formData quando profile mudar
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        username: profile.username || '',
        displayName: profile.display_name || '',
        walletAddress: profile.wallet_address || '',
        email: user?.email || ''
      }));
    }
  }, [profile, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (mode === 'register') {
      if (!formData.username.trim()) errors.username = 'Nome de usuário é obrigatório';
      if (!formData.email.trim()) errors.email = 'Email é obrigatório';
      if (!formData.password) errors.password = 'Senha é obrigatória';
      if (formData.password.length < 6) errors.password = 'Senha deve ter pelo menos 6 caracteres';
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Senhas não coincidem';
    }

    if (mode === 'login') {
      if (!formData.email.trim()) errors.email = 'Email é obrigatório';
      if (!formData.password) errors.password = 'Senha é obrigatória';
    }

    if (mode === 'edit') {
      if (!formData.username.trim()) errors.username = 'Nome de usuário é obrigatório';
      if (!formData.displayName.trim()) errors.displayName = 'Nome de exibição é obrigatório';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      let result;

      if (mode === 'register') {
        result = await signUp({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName || formData.username,
          walletAddress: formData.walletAddress
        });
      } else if (mode === 'login') {
        result = await signIn(formData.email, formData.password);
      } else if (mode === 'edit') {
        result = await updateProfile({
          username: formData.username,
          display_name: formData.displayName,
          wallet_address: formData.walletAddress
        });
      }

      if (result.success) {
        if (mode === 'register' || mode === 'login') {
          setMode('view');
        }
        // Limpar formulário
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          displayName: '',
          walletAddress: ''
        });
      }
    } catch (error) {
      console.error('Erro no submit:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setMode('view');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  // Renderizar formulário de registro
  const renderRegisterForm = () => (
    <div className="auth-form-container">
      <h2 className="auth-form-title">
        <FaUserPlus className="auth-form-icon" />
        {t('signUp')}
      </h2>
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">{t('username')} *</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className={formErrors.username ? 'error' : ''}
            placeholder={t('chooseUniqueName')}
          />
          {formErrors.username && <span className="error-message">{formErrors.username}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">{t('email')} *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={formErrors.email ? 'error' : ''}
            placeholder="seu@email.com"
          />
          {formErrors.email && <span className="error-message">{formErrors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">{t('password')} *</label>
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={formErrors.password ? 'error' : ''}
              placeholder={t('minimumCharacters')}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {formErrors.password && <span className="error-message">{formErrors.password}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">{t('confirmPassword')} *</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={formErrors.confirmPassword ? 'error' : ''}
            placeholder={t('confirmPasswordAgain')}
          />
          {formErrors.confirmPassword && <span className="error-message">{formErrors.confirmPassword}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="displayName">{t('displayName')}</label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleInputChange}
            placeholder="Como você quer ser chamado"
          />
        </div>

        <div className="form-group">
          <label htmlFor="walletAddress">{t('walletAddress')}</label>
          <input
            type="text"
            id="walletAddress"
            name="walletAddress"
            value={formData.walletAddress}
            onChange={handleInputChange}
            placeholder="0x1234..."
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <FaSpinner className="spinner" /> : t('signUp')}
          </button>
          <button type="button" className="btn-secondary" onClick={() => setMode('login')}>
            {t('alreadyHaveAccountButton')}
          </button>
        </div>
      </form>
    </div>
  );

  // Renderizar formulário de login
  const renderLoginForm = () => (
    <div className="auth-form-container">
      <h2 className="auth-form-title">
        <FaSignInAlt className="auth-form-icon" />
        {t('signIn')}
      </h2>
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">{t('email')} *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={formErrors.email ? 'error' : ''}
            placeholder="seu@email.com"
          />
          {formErrors.email && <span className="error-message">{formErrors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">{t('password')} *</label>
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={formErrors.password ? 'error' : ''}
              placeholder="Sua senha"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {formErrors.password && <span className="error-message">{formErrors.password}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <FaSpinner className="spinner" /> : t('signIn')}
          </button>
          <button type="button" className="btn-secondary" onClick={() => setMode('register')}>
            {t('createAccountButton')}
          </button>
        </div>
      </form>
    </div>
  );

  // Renderizar perfil do usuário
  const renderUserProfile = () => (
    <div className="user-profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <FaUser className="avatar-icon" />
        </div>
        <div className="profile-info">
          <h2 className="profile-name">{profile?.display_name || profile?.username}</h2>
          <p className="profile-username">@{profile?.username}</p>
          <p className="profile-email">{user?.email}</p>
        </div>
        <button className="edit-profile-btn" onClick={() => setMode('edit')}>
          <FaEdit />
        </button>
      </div>

      {/* Estatísticas do Jogo */}
      <div className="game-stats-section">
        <h3 className="stats-title">
          <FaChartLine className="stats-icon" />
          {t('gameStats')}
        </h3>
        <div className="stats-grid">
          <div className="stat-card">
            <FaTrophy className="stat-icon" />
            <div className="stat-content">
              <span className="stat-label">{t('totalCoins')}</span>
              <span className="stat-value">{gameStats?.totalCoins || 0}</span>
            </div>
          </div>
          <div className="stat-card">
            <FaChartLine className="stat-icon" />
            <div className="stat-content">
              <span className="stat-label">{t('level')}</span>
              <span className="stat-value">{gameStats?.level || 1}</span>
            </div>
          </div>
          <div className="stat-card">
            <FaChartLine className="stat-icon" />
            <div className="stat-content">
              <span className="stat-label">{t('totalClicks')}</span>
              <span className="stat-value">{gameStats?.totalClicks || 0}</span>
            </div>
          </div>
          <div className="stat-card">
            <FaTrophy className="stat-icon" />
            <div className="stat-content">
              <span className="stat-label">{t('maxStreak')}</span>
              <span className="stat-value">{gameStats?.maxStreak || 0}</span>
            </div>
          </div>
          <div className="stat-card">
            <FaTrophy className="stat-icon" />
            <div className="stat-content">
              <span className="stat-label">{t('achievements')}</span>
              <span className="stat-value">{gameStats?.achievements || 0}</span>
            </div>
          </div>
          <div className="stat-card">
            <FaTrophy className="stat-icon" />
            <div className="stat-content">
              <span className="stat-label">{t('prestigeLevel')}</span>
              <span className="stat-value">{gameStats?.prestigeLevel || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Referidos */}
      <div className="referrals-dashboard-section">
        <h3 className="stats-title">
          <FaUsers className="stats-icon" />
          Sistema de Referência
        </h3>
        <div className="referrals-dashboard-content">
          <div className="referral-code-dashboard">
            <div className="referral-code-info">
              <span className="referral-code-label">Seu Código:</span>
              <div className="referral-code-display">
                <span className="referral-code-text">{gameStats?.referralId || 'N/A'}</span>
                <button 
                  className="referral-copy-btn-small"
                  onClick={() => {
                    if (gameStats?.referralId) {
                      navigator.clipboard.writeText(gameStats.referralId);
                    }
                  }}
                  title="Copiar código"
                >
                  <FaCopy />
                </button>
              </div>
            </div>
            <div className="referrals-count-dashboard">
              <span className="referrals-count-label">Referidos:</span>
              <span className="referrals-count-value">{gameStats?.referrals?.length || 0}</span>
            </div>
          </div>
          
          {gameStats?.referrals && gameStats.referrals.length > 0 && (
            <div className="referrals-list-dashboard">
              <h4 className="referrals-list-title">Seus Referidos:</h4>
              <div className="referrals-grid">
                {gameStats.referrals.slice(0, 6).map((ref, index) => (
                  <div key={index} className="referral-item-dashboard">
                    <FaUser className="referral-item-icon" />
                    <span className="referral-item-name">{ref}</span>
                  </div>
                ))}
                {gameStats.referrals.length > 6 && (
                  <div className="referral-more">
                    +{gameStats.referrals.length - 6} mais
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ranking */}
      <div className="ranking-section">
        <h3 className="ranking-title">
          <FaTrophy className="ranking-icon" />
          {t('ranking')}
        </h3>
        <div className="ranking-cards">
          <div className="ranking-card">
            <FaTrophy className="ranking-card-icon" />
            <div className="ranking-card-content">
              <span className="ranking-card-label">{t('yourPosition')}</span>
              <span className="ranking-card-value">#{userRank?.rank || 'N/A'}</span>
            </div>
          </div>
          <div className="ranking-card">
            <FaChartLine className="ranking-card-icon" />
            <div className="ranking-card-content">
              <span className="ranking-card-label">{t('levelRanking')}</span>
              <span className="ranking-card-value">#{userRank?.rank || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-actions">
        <button className="btn-secondary" onClick={handleLogout}>
          <FaSignOutAlt />
          {t('logout')}
        </button>
      </div>
    </div>
  );

  // Renderizar formulário de edição
  const renderEditForm = () => (
    <div className="auth-form-container">
      <h2 className="auth-form-title">
        <FaEdit className="auth-form-icon" />
        {t('editProfile')}
      </h2>
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="username">{t('username')} *</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className={formErrors.username ? 'error' : ''}
          />
          {formErrors.username && <span className="error-message">{formErrors.username}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="displayName">Nome de Exibição *</label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleInputChange}
            className={formErrors.displayName ? 'error' : ''}
          />
          {formErrors.displayName && <span className="error-message">{formErrors.displayName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="walletAddress">{t('walletAddress')}</label>
          <input
            type="text"
            id="walletAddress"
            name="walletAddress"
            value={formData.walletAddress}
            onChange={handleInputChange}
            placeholder="0x1234..."
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <FaSpinner className="spinner" /> : 'Salvar'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => setMode('view')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="auth-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <FaUser className="dashboard-icon" />
          {t('userProfile')}
        </h1>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError} className="error-close">
            <FaTimes />
          </button>
        </div>
      )}

      <div className="dashboard-content">
        {!isLoggedIn ? (
          <div className="auth-options">
            <div className="auth-option-cards">
              <div className="auth-option-card" onClick={() => setMode('login')}>
                <FaSignInAlt className="option-icon" />
                <h3>{t('signIn')}</h3>
                <p>{t('alreadyHaveAccount')}</p>
              </div>
              <div className="auth-option-card" onClick={() => setMode('register')}>
                <FaUserPlus className="option-icon" />
                <h3>{t('signUp')}</h3>
                <p>{t('newToGame')}</p>
              </div>
            </div>
          </div>
        ) : null}

        {mode === 'register' && renderRegisterForm()}
        {mode === 'login' && renderLoginForm()}
        {mode === 'edit' && renderEditForm()}
        {mode === 'view' && isLoggedIn && renderUserProfile()}
      </div>
    </div>
  );
};

export default AuthDashboard;
