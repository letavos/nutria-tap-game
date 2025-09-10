import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { FaEnvelope, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const EmailVerification = ({ onVerified }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
  const [isVerified, setIsVerified] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Verificar se o usuário já está verificado
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email_confirmed_at) {
        setIsVerified(true);
        setMessage(t('emailAlreadyVerified') || 'Email already verified!');
        setMessageType('success');
        if (onVerified) onVerified();
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  const resendVerification = async () => {
    if (!email) {
      setMessage(t('pleaseEnterEmail') || 'Please enter your email');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/#auth-callback`
        }
      });

      if (error) {
        throw error;
      }

      setMessage(t('verificationEmailResent') || 'Verification email resent! Check your inbox.');
      setMessageType('success');
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
      setMessage(`${t('error')}: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setMessage('');
  };

  if (isVerified) {
    return (
      <div className="email-verification-container">
        <div className="email-verification-success">
          <FaCheckCircle className="success-icon" />
          <h3>{t('emailVerifiedTitle') || 'Email Verified!'}</h3>
          <p>{t('emailVerifiedMessage') || 'Your email was verified. You can continue using the game.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="email-verification-container">
      <div className="email-verification-card">
        <div className="email-verification-header">
          <FaEnvelope className="email-icon" />
          <h3>{t('emailVerificationRequired') || 'Email Verification Required'}</h3>
          <p>{t('emailVerificationInfo') || 'To continue, you need to verify your email.'}</p>
        </div>

        <div className="email-verification-form">
          <div className="form-group">
            <label htmlFor="email">{t('email')}:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder={t('enterEmail')}
              disabled={loading}
            />
          </div>

          <button
            onClick={resendVerification}
            disabled={loading || !email}
            className="resend-button"
          >
            {loading ? (
              <>
                <FaSpinner className="spinner" />
                {t('sending') || 'Sending...'}
              </>
            ) : (
              <>
                <FaEnvelope />
                {t('resendVerificationEmail') || 'Resend Verification Email'}
              </>
            )}
          </button>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {messageType === 'error' && <FaExclamationTriangle />}
            {messageType === 'success' && <FaCheckCircle />}
            <span>{message}</span>
          </div>
        )}

        <div className="email-verification-help">
          <h4>{t('commonProblems') || 'Common problems:'}</h4>
          <ul>
            <li>{t('checkSpam') || 'Check your spam folder'}</li>
            <li>{t('ensureEmailCorrect') || 'Make sure the email is correct'}</li>
            <li>{t('linkMayExpire') || 'The link may have expired - resend a new one'}</li>
            <li>{t('ifProblemPersists') || 'If the problem persists, try creating a new account'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
