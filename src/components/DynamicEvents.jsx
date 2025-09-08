import { useState, useEffect } from 'react';
import { FaGift, FaClock, FaFire, FaStar, FaTrophy, FaTimes } from 'react-icons/fa';
import { useGame } from '../context/GameContext';

const DynamicEvents = () => {
  const { gameState } = useGame();
  const [activeEvents, setActiveEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(null);

  // Simular eventos dinâmicos
  useEffect(() => {
    const events = [
      {
        id: 'double_coins',
        name: 'Dia de Sorte!',
        description: 'Ganhe o dobro de moedas por 1 hora!',
        type: 'multiplier',
        value: 2,
        duration: 3600000, // 1 hora
        icon: <FaGift />,
        color: '#ffb700',
        active: Math.random() > 0.7, // 30% chance de estar ativo
        startTime: Date.now() - Math.random() * 1800000, // Começou há até 30 min
        requirement: null
      },
      {
        id: 'streak_bonus',
        name: 'Streak Mania!',
        description: 'Streaks dão 3x mais pontos!',
        type: 'streak_multiplier',
        value: 3,
        duration: 1800000, // 30 minutos
        icon: <FaFire />,
        color: '#f39c12',
        active: Math.random() > 0.8, // 20% chance
        startTime: Date.now() - Math.random() * 900000,
        requirement: null
      },
      {
        id: 'prestige_boost',
        name: 'Prestígio Turbo!',
        description: 'Prestígio dá 50% mais pontos!',
        type: 'prestige_boost',
        value: 1.5,
        duration: 7200000, // 2 horas
        icon: <FaStar />,
        color: '#6c47ff',
        active: Math.random() > 0.9, // 10% chance
        startTime: Date.now() - Math.random() * 3600000,
        requirement: 'Prestígio nível 1+'
      },
      {
        id: 'achievement_hunt',
        name: 'Caça às Conquistas!',
        description: 'Conquistas dão 2x mais pontos de airdrop!',
        type: 'achievement_boost',
        value: 2,
        duration: 5400000, // 1.5 horas
        icon: <FaTrophy />,
        color: '#1db954',
        active: Math.random() > 0.85, // 15% chance
        startTime: Date.now() - Math.random() * 2700000,
        requirement: null
      }
    ];

    setActiveEvents(events.filter(event => event.active));
  }, []);

  const getTimeRemaining = (event) => {
    const elapsed = Date.now() - event.startTime;
    const remaining = event.duration - elapsed;
    return Math.max(0, remaining);
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const canParticipate = (event) => {
    if (!event.requirement) return true;
    
    switch (event.requirement) {
      case 'Prestígio nível 1+':
        return gameState.prestige.level >= 1;
      default:
        return true;
    }
  };

  const getEventProgress = (event) => {
    const elapsed = Date.now() - event.startTime;
    return Math.min(100, (elapsed / event.duration) * 100);
  };

  if (activeEvents.length === 0) {
    return (
      <div className="dynamic-events-container">
        <div className="events-header">
          <h3>Eventos Dinâmicos</h3>
          <p>Eventos especiais aparecem aleatoriamente!</p>
        </div>
        <div className="no-events">
          <FaClock />
          <p>Nenhum evento ativo no momento</p>
          <small>Volte mais tarde para eventos especiais!</small>
        </div>
      </div>
    );
  }

  return (
    <div className="dynamic-events-container">
      <div className="events-header">
        <h3>Eventos Dinâmicos</h3>
        <p>Eventos especiais em andamento!</p>
      </div>

      <div className="events-grid">
        {activeEvents.map(event => {
          const timeRemaining = getTimeRemaining(event);
          const progress = getEventProgress(event);
          const canJoin = canParticipate(event);

          return (
            <div
              key={event.id}
              className={`event-card ${canJoin ? 'available' : 'locked'}`}
              style={{ borderColor: event.color }}
              onClick={() => canJoin && setShowEventModal(event)}
            >
              <div className="event-header">
                <div className="event-icon" style={{ color: event.color }}>
                  {event.icon}
                </div>
                <div className="event-timer">
                  <FaClock />
                  <span>{formatTime(timeRemaining)}</span>
                </div>
              </div>

              <div className="event-content">
                <h4 className="event-name">{event.name}</h4>
                <p className="event-description">{event.description}</p>
                
                <div className="event-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: event.color
                      }}
                    />
                  </div>
                  <span className="progress-text">{Math.round(progress)}%</span>
                </div>
              </div>

              <div className="event-footer">
                {canJoin ? (
                  <div className="event-status available">
                    <FaGift />
                    <span>Ativo</span>
                  </div>
                ) : (
                  <div className="event-status locked">
                    <FaTimes />
                    <span>{event.requirement}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showEventModal && (
        <div className="event-modal-overlay" onClick={() => setShowEventModal(null)}>
          <div className="event-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon" style={{ color: showEventModal.color }}>
                {showEventModal.icon}
              </div>
              <h3>{showEventModal.name}</h3>
              <button onClick={() => setShowEventModal(null)}>×</button>
            </div>
            
            <div className="modal-content">
              <p className="modal-description">{showEventModal.description}</p>
              
              <div className="modal-details">
                <div className="detail-row">
                  <span>Multiplicador:</span>
                  <span style={{ color: showEventModal.color }}>
                    {showEventModal.value}x
                  </span>
                </div>
                <div className="detail-row">
                  <span>Tempo restante:</span>
                  <span>{formatTime(getTimeRemaining(showEventModal))}</span>
                </div>
                <div className="detail-row">
                  <span>Progresso:</span>
                  <span>{Math.round(getEventProgress(showEventModal))}%</span>
                </div>
              </div>

              <div className="modal-benefits">
                <h4>Benefícios:</h4>
                <ul>
                  {showEventModal.type === 'multiplier' && (
                    <li>Ganhe {showEventModal.value}x mais moedas</li>
                  )}
                  {showEventModal.type === 'streak_multiplier' && (
                    <li>Streaks dão {showEventModal.value}x mais pontos</li>
                  )}
                  {showEventModal.type === 'prestige_boost' && (
                    <li>Prestígio dá {showEventModal.value}x mais pontos</li>
                  )}
                  {showEventModal.type === 'achievement_boost' && (
                    <li>Conquistas dão {showEventModal.value}x mais pontos de airdrop</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicEvents;
