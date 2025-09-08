import { useState } from 'react';
import { FaUser, FaEnvelope, FaWallet, FaTrophy, FaChartLine, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const UserProfile = ({ isOpen, onClose }) => {
  const { user, isLoggedIn, signUp, signIn, signOut, updateProfile, updateUserStats } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState('view');
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FaUser className="modal-icon" />
            {isLoggedIn ? t('userProfile') : t('userAccount')}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {!isLoggedIn ? (
            <div className="user-auth">
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
          ) : (
            <div className="user-profile">
              {mode === 'view' && (
                <>
                  <div className="profile-header">
                    <div className="profile-avatar">
                      <FaUser />
                    </div>
                    <div className="profile-info">
                      <h3>{user.username}</h3>
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

                  <div className="profile-stats">
                    <h4><FaChartLine /> {t('statistics')}</h4>
                    <div className="stats-grid">
                      <div className="stat-item">
                        <span className="stat-label">{t('totalCoins')}</span>
                        <span className="stat-value">{user.stats.totalCoins.toLocaleString()}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">{t('level')}</span>
                        <span className="stat-value">{user.stats.level}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">{t('totalClicks')}</span>
                        <span className="stat-value">{user.stats.totalClicks.toLocaleString()}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">{t('maxStreak')}</span>
                        <span className="stat-value">{user.stats.maxStreak}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">{t('achievements')}</span>
                        <span className="stat-value">{user.stats.achievements}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">{t('prestigeLevel')}</span>
                        <span className="stat-value">{user.stats.prestigeLevel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="profile-ranking">
                    <h4><FaTrophy /> {t('ranking')}</h4>
                    <div className="ranking-info">
                      <p>{t('yourRank')}: <strong>#{getUserRank('totalCoins') || 'N/A'}</strong></p>
                      <p>{t('levelRank')}: <strong>#{getUserRank('level') || 'N/A'}</strong></p>
                    </div>
                  </div>

                  <div className="profile-actions">
                    <button className="button danger" onClick={handleLogout}>
                      {t('logout')}
                    </button>
                  </div>
                </>
              )}

              {mode === 'edit' && (
                <form onSubmit={handleSaveEdit} className="edit-form">
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
