import { useState, useEffect } from 'react';
import { FaGift, FaMedal, FaStar, FaTrophy } from 'react-icons/fa';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';

const EventsTab = () => {
  const { gameState, isEventActive } = useGame();
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Eventos iniciais baseados na imagem
    const initialEvents = [
      {
        id: 'first_skin',
        name: t('firstSkin'),
        description: t('unlockSkin'),
        icon: <FaMedal />,
        status: gameState.achievements.includes('skinUnlock') ? 'unlocked' : 'locked',
        category: 'permanent'
      },
      {
        id: 'airdrop_100',
        name: t('airdrop100'),
        description: t('reach100Airdrop'),
        icon: <FaMedal />,
        status: gameState.achievements.includes('airdrop100') ? 'unlocked' : 'locked',
        category: 'permanent'
      },
      {
        id: 'natal_achievement',
        name: t('conquista_natal'),
        description: t('participateNatal'),
        icon: <FaGift />,
        status: isEventActive('natal2024') ? 'active' : 'out_of_event',
        category: 'seasonal',
        eventId: 'natal2024'
      },
      {
        id: 'carnaval_achievement',
        name: t('conquista_carnaval'),
        description: t('participateCarnaval'),
        icon: <FaGift />,
        status: isEventActive('carnaval2025') ? 'active' : 'out_of_event',
        category: 'seasonal',
        eventId: 'carnaval2025'
      }
    ];

    setEvents(initialEvents);
  }, [gameState.achievements, isEventActive, t]);

  const getStatusText = (event) => {
    switch (event.status) {
      case 'unlocked':
        return t('unlocked');
      case 'locked':
        return t('locked');
      case 'active':
        return t('eventActive');
      case 'out_of_event':
        return t('outOfEvent');
      default:
        return t('locked');
    }
  };

  const getStatusColor = (event) => {
    switch (event.status) {
      case 'unlocked':
        return '#2ecc71'; // Verde
      case 'locked':
        return '#e74c3c'; // Vermelho
      case 'active':
        return '#f39c12'; // Laranja
      case 'out_of_event':
        return '#e67e22'; // Laranja escuro
      default:
        return '#e74c3c';
    }
  };

  const getEventIcon = (event) => {
    if (event.status === 'unlocked') {
      return <FaTrophy style={{ color: '#f1c40f' }} />;
    }
    return event.icon;
  };

  return (
    <div className="events-tab-container">
      <div className="events-header">
        <h3>{t('events')}</h3>
        <p>{t('eventsHeaderDesc')}</p>
      </div>

      <div className="events-list">
        {events.map(event => (
          <div 
            key={event.id} 
            className={`event-card ${event.status}`}
            style={{ borderColor: getStatusColor(event) }}
          >
            <div className="event-icon">
              {getEventIcon(event)}
            </div>
            
            <div className="event-content">
              <h4 className="event-title">{event.name}</h4>
              <p className="event-description">{event.description}</p>
            </div>
            
            <div className="event-status">
              {event.category === 'seasonal' && event.status === 'out_of_event' && (
                <FaGift className="event-gift-icon" />
              )}
              <span 
                className="status-text"
                style={{ color: getStatusColor(event) }}
              >
                {getStatusText(event)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="events-info">
        <div className="info-card">
          <h4>{t('howEventsWork')}</h4>
          <ul>
            <li><strong>{t('permanentEvents')}:</strong> {t('permanentEventsDesc')}</li>
            <li><strong>{t('seasonalEvents')}:</strong> {t('seasonalEventsDesc')}</li>
            <li><strong>{t('rewards')}:</strong> {t('eventRewards')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EventsTab;
