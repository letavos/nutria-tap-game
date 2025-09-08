import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { FaEnvelope, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

const EmailVerification = ({ onVerified }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Verificar se o usuário já está verificado
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email_confirmed_at) {
        setIsVerified(true);
        setMessage('Email já verificado!');
        setMessageType('success');
        if (onVerified) onVerified();
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  const resendVerification = async () => {
    if (!email) {
      setMessage('Por favor, digite seu email');
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

      setMessage('Email de verificação reenviado! Verifique sua caixa de entrada.');
      setMessageType('success');
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
      setMessage(`Erro: ${error.message}`);
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
          <h3>Email Verificado!</h3>
          <p>Seu email foi verificado com sucesso. Você pode continuar usando o jogo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="email-verification-container">
      <div className="email-verification-card">
        <div className="email-verification-header">
          <FaEnvelope className="email-icon" />
          <h3>Verificação de Email Necessária</h3>
          <p>Para continuar, você precisa verificar seu email.</p>
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
                Enviando...
              </>
            ) : (
              <>
                <FaEnvelope />
                Reenviar Email de Verificação
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
          <h4>Problemas comuns:</h4>
          <ul>
            <li>Verifique sua caixa de spam</li>
            <li>Certifique-se de que o email está correto</li>
            <li>O link pode ter expirado - reenvie um novo</li>
            <li>Se o problema persistir, tente criar uma nova conta</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
