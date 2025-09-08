import { useState } from 'react';
import { FaCopy, FaUserPlus, FaCheck, FaUser } from 'react-icons/fa';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';

const Referral = () => {
  const { gameState, addReferral } = useGame();
  const { t } = useLanguage();
  const { referralId, referrals } = gameState;
  const [newReferral, setNewReferral] = useState('');
  const [copied, setCopied] = useState(false);
  const [referralAdded, setReferralAdded] = useState(false);
  const [countAnim, setCountAnim] = useState(false);
  
  // Copia o ID de referência para a área de transferência
  const copyReferralId = () => {
    navigator.clipboard.writeText(referralId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Adiciona um novo referido
  const handleAddReferral = async (e) => {
    e.preventDefault();
    
    if (newReferral && newReferral.length === 8) {
      try {
        const success = await addReferral(newReferral);
        
        if (success) {
          setNewReferral('');
          setReferralAdded(true);
          setCountAnim(true);
          setTimeout(() => setReferralAdded(false), 2000);
          setTimeout(() => setCountAnim(false), 700);
        }
        // As notificações de erro agora são mostradas pelo GameContext
      } catch (error) {
        console.error('Erro ao adicionar referência:', error);
        // As notificações de erro agora são mostradas pelo GameContext
      }
    } else {
      // Mostrar notificação de erro para código inválido
      // Isso será tratado pelo GameContext também
    }
  };
  
  return (
    <div className="referral-container">
      <div className="card referral-card">
        <div className="referral-header">
          <FaUser size={48} className="referral-header-icon" />
          <h3 className="referral-header-title">{t('referralSystem')}</h3>
          <p className="referral-header-subtitle">{t('inviteFriends')}</p>
        </div>
        
        <div className="referral-code-section">
          <div className="referral-code-card">
            <div className="referral-code-header">
              <h4 className="referral-code-title">{t('yourReferralCode')}</h4>
            </div>
            <div className="referral-code-display">
              <div className="referral-code">{referralId}</div>
              <button 
                className={`referral-copy-btn ${copied ? 'copied' : ''}`}
                onClick={copyReferralId}
                title={copied ? 'Copiado!' : 'Copiar código'}
              >
                {copied ? <FaCheck /> : <FaCopy />}
              </button>
            </div>
            <p className="referral-instruction">{t('shareCode')}</p>
          </div>
        </div>
        
        <div className="referral-form-section">
          <div className="referral-form-card">
            <div className="referral-form-header">
              <h4 className="referral-form-title">{t('addReferralCode')}</h4>
            </div>
            <form className="referral-form" onSubmit={handleAddReferral}>
              <div className="referral-input-group">
                <input 
                  type="text" 
                  className="referral-input"
                  value={newReferral}
                  onChange={(e) => setNewReferral(e.target.value)}
                  placeholder={t('enterReferralCode')}
                  maxLength={8}
                />
                <button 
                  type="submit" 
                  className="referral-add-btn"
                  disabled={!newReferral || newReferral.length < 8}
                  title={t('addReferral')}
                >
                  <FaUserPlus />
                </button>
              </div>
            </form>
            {referralAdded && (
              <div className="referral-success">
                ✓ Código adicionado com sucesso!
              </div>
            )}
          </div>
        </div>
        
        <div className="referrals-stats-section">
          <div className="referrals-stats-card">
            <div className="referrals-stats-header">
              <h4 className="referrals-stats-title">{t('yourReferrals')}</h4>
              <div className={`referrals-count ${countAnim ? 'countPulse' : ''}`}>
                {referrals.length}
              </div>
            </div>
            
            {referrals.length > 0 ? (
              <div className="referrals-grid">
                {referrals.map((ref, index) => (
                  <div key={index} className="referral-item">
                    <div className="referral-item-content">
                      <div className="referral-item-icon">
                        <FaUser />
                      </div>
                      <span className="referral-item-name">{ref}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="referrals-empty">
                {t('noReferralsYet')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referral; 