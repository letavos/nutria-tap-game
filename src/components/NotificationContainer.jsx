import { useGame } from '../context/GameContext';
import GameNotification from './GameNotification';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useGame();

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <GameNotification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
