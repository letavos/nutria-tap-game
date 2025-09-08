import { useState, useEffect } from 'react';
import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const GameNotification = ({ message, type = 'info', duration = 3000, onClose }) => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheck className="notification-icon success" />;
      case 'error':
        return <FaExclamationTriangle className="notification-icon error" />;
      case 'warning':
        return <FaExclamationTriangle className="notification-icon warning" />;
      default:
        return <FaInfoCircle className="notification-icon info" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`game-notification ${type} ${isVisible ? 'show' : 'hide'}`}>
      <div className="notification-content">
        {getIcon()}
        <span className="notification-message">{message}</span>
        <button 
          className="notification-close"
          onClick={handleClose}
          title={t('close')}
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default GameNotification;
