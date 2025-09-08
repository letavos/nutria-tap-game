import React from 'react';
import { useGame } from '../context/GameContext';
import { FaSync, FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaClock } from 'react-icons/fa';

const SyncStatus = () => {
  const { 
    lastSyncTimestamp, 
    isDataValidated, 
    fraudDetection, 
    syncWithServer 
  } = useGame();

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Nunca';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Agora mesmo';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return date.toLocaleDateString();
  };

  const getSyncStatus = () => {
    if (fraudDetection.suspiciousActivity) {
      return {
        icon: <FaExclamationTriangle className="text-red-500" />,
        text: 'Atividade Suspeita',
        color: 'text-red-500',
        bgColor: 'bg-red-100'
      };
    }
    
    if (!isDataValidated) {
      return {
        icon: <FaClock className="text-yellow-500" />,
        text: 'Validando...',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100'
      };
    }
    
    return {
      icon: <FaCheckCircle className="text-green-500" />,
      text: 'Sincronizado',
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    };
  };

  const status = getSyncStatus();

  return (
    <div className="sync-status-container">
      <div className={`sync-status ${status.bgColor}`}>
        <div className="sync-info">
          <div className="sync-icon">
            {status.icon}
          </div>
          <div className="sync-details">
            <div className={`sync-text ${status.color}`}>
              {status.text}
            </div>
            <div className="sync-timestamp">
              Última sincronização: {formatTimestamp(lastSyncTimestamp)}
            </div>
          </div>
        </div>
        
        <div className="sync-actions">
          <button
            onClick={syncWithServer}
            className="sync-button"
            title="Sincronizar com servidor"
          >
            <FaSync className="sync-icon" />
          </button>
          
          {fraudDetection.suspiciousActivity && (
            <div className="fraud-warning">
              <FaShieldAlt className="text-red-500" />
              <span>Proteção ativa</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncStatus;
