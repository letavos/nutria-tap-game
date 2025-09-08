import { useState } from 'react';
import { FaUser, FaEnvelope, FaWallet, FaTrophy, FaChartLine, FaEdit, FaSave, FaTimes, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const UserDashboard = () => {
  const { user, profile, isLoggedIn, signUp, signIn, signOut, updateProfile, updateUserStats, getRanking, loading, error } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState('view'); // 'view', 'register', 'login', 'edit'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    wallet: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await registerUser(formData);
      setMode('view');
      setFormData({ username: '', email: '', wallet: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginUser(formData.username);
      setMode('view');
      setFormData({ username: '', email: '', wallet: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setFormData({
      username: user.username,
      email: user.email,
      wallet: user.wallet
    });
    setMode('edit');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      updateUser(formData);
      setMode('view');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setMode('view');
  };

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <FaUser className="title-icon" />
            <h1>{isLoggedIn ? t('userProfile') : t('userAccount')}</h1>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {!isLoggedIn ? (
          // Usuário não logado
          <div className="auth-section">
            <div className="auth-container">
              <div className="auth-tabs">
                <button 
                  className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => setMode('login')}
                >
                  {t('login')}
                </button>
                <button 
                  className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
                  onClick={() => setMode('register')}
                >
                  {t('register')}
                </button>
              </div>

              {mode === 'login' && (
                <form onSubmit={handleLogin} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="username">{t('username')}</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder={t('enterUsername')}
                      required
                    />
                  </div>
                  
                  <button type="submit" className="button primary" disabled={loading}>
                    {loading ? t('loading') : t('login')}
                  </button>
                </form>
              )}

              {mode === 'register' && (
                <form onSubmit={handleRegister} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="username">{t('username')}</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder={t('enterUsername')}
                      required
                      minLength={3}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">{t('email')}</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t('enterEmail')}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="wallet">{t('walletAddress')}</label>
                    <input
                      type="text"
                      id="wallet"
                      name="wallet"
                      value={formData.wallet}
                      onChange={handleInputChange}
                      placeholder="0x..."
                      required
                      pattern="^0x[a-fA-F0-9]{40}$"
                    />
                    <small className="form-help">{t('walletHelp')}</small>
                  </div>
                  
                  <button type="submit" className="button primary" disabled={loading}>
                    {loading ? t('loading') : t('register')}
                  </button>
                </form>
              )}

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Usuário logado
          <div className="profile-section">
            {mode === 'view' && (
              <>
                <div className="profile-card">
                  <div className="profile-header">
                    <div className="profile-avatar">
                      <FaUser />
                    </div>
                    <div className="profile-info">
                      <h2>{user.username}</h2>
                      <p className="profile-email">
                        <FaEnvelope /> {user.email}
                      </p>
                      <p className="profile-wallet">
                        <FaWallet /> {user.wallet}
                      </p>
                    </div>
                    <button className="button secondary" onClick={handleEdit}>
                      <FaEdit /> {t('edit')}
                    </button>
                  </div>
                </div>

                <div className="stats-section">
                  <h3><FaChartLine /> {t('statistics')}</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <FaTrophy />
                      </div>
                      <div className="stat-content">
                        <span className="stat-label">{t('totalCoins')}</span>
                        <span className="stat-value">{user.stats.totalCoins.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <FaChartLine />
                      </div>
                      <div className="stat-content">
                        <span className="stat-label">{t('level')}</span>
                        <span className="stat-value">{user.stats.level}</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <FaChartLine />
                      </div>
                      <div className="stat-content">
                        <span className="stat-label">{t('totalClicks')}</span>
                        <span className="stat-value">{user.stats.totalClicks.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <FaTrophy />
                      </div>
                      <div className="stat-content">
                        <span className="stat-label">{t('maxStreak')}</span>
                        <span className="stat-value">{user.stats.maxStreak}</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <FaTrophy />
                      </div>
                      <div className="stat-content">
                        <span className="stat-label">{t('achievements')}</span>
                        <span className="stat-value">{user.stats.achievements}</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <FaTrophy />
                      </div>
                      <div className="stat-content">
                        <span className="stat-label">{t('prestigeLevel')}</span>
                        <span className="stat-value">{user.stats.prestigeLevel}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ranking-section">
                  <h3><FaTrophy /> {t('ranking')}</h3>
                  <div className="ranking-cards">
                    <div className="ranking-card">
                      <div className="ranking-icon">
                        <FaTrophy />
                      </div>
                      <div className="ranking-content">
                        <span className="ranking-label">{t('yourRank')}</span>
                        <span className="ranking-value">#{getUserRank('totalCoins') || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="ranking-card">
                      <div className="ranking-icon">
                        <FaChartLine />
                      </div>
                      <div className="ranking-content">
                        <span className="ranking-label">{t('levelRank')}</span>
                        <span className="ranking-value">#{getUserRank('level') || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="actions-section">
                  <button className="button danger" onClick={handleLogout}>
                    <FaSignOutAlt /> {t('logout')}
                  </button>
                </div>
              </>
            )}

            {mode === 'edit' && (
              <div className="edit-section">
                <form onSubmit={handleSaveEdit} className="edit-form">
                  <h3><FaEdit /> {t('edit')} {t('userProfile')}</h3>
                  
                  <div className="form-group">
                    <label htmlFor="username">{t('username')}</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      minLength={3}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">{t('email')}</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="wallet">{t('walletAddress')}</label>
                    <input
                      type="text"
                      id="wallet"
                      name="wallet"
                      value={formData.wallet}
                      onChange={handleInputChange}
                      required
                      pattern="^0x[a-fA-F0-9]{40}$"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="button primary" disabled={loading}>
                      <FaSave /> {t('save')}
                    </button>
                    <button 
                      type="button" 
                      className="button secondary" 
                      onClick={() => setMode('view')}
                    >
                      <FaTimes /> {t('cancel')}
                    </button>
                  </div>

                  {error && (
                    <div className="error-message">
                      {error}
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
