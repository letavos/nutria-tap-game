// Serviço de Notificações para Nutria Tap PWA
class NotificationService {
  constructor() {
    this.permission = Notification.permission;
    this.subscription = null;
  }

  // Solicitar permissão para notificações
  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('Este navegador não suporta notificações');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      console.log('Notificações foram negadas');
      return false;
    }

    this.permission = await Notification.requestPermission();
    return this.permission === 'granted';
  }

  // Mostrar notificação local
  showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      console.log('Permissão para notificações não concedida');
      return;
    }

    const defaultOptions = {
      icon: '/src/assets/nutria_1.png',
      badge: '/src/assets/nutria_1.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      ...options
    };

    const notification = new Notification(title, defaultOptions);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }

  // Notificação de recompensa diária
  showDailyRewardNotification() {
    return this.showNotification('🎁 Recompensa Diária Disponível!', {
      body: 'Sua recompensa diária está pronta para ser coletada!',
      tag: 'daily-reward',
      requireInteraction: true
    });
  }

  // Notificação de level up
  showLevelUpNotification(level) {
    return this.showNotification(`🎉 Level Up!`, {
      body: `Parabéns! Você alcançou o nível ${level}!`,
      tag: 'level-up',
      requireInteraction: true
    });
  }

  // Notificação de conquista
  showAchievementNotification(achievement) {
    return this.showNotification('🏆 Nova Conquista!', {
      body: `Você desbloqueou: ${achievement}`,
      tag: 'achievement',
      requireInteraction: true
    });
  }

  // Notificação de ranking
  showRankingNotification(rank) {
    return this.showNotification('📊 Ranking Atualizado!', {
      body: `Você está na posição #${rank} do ranking!`,
      tag: 'ranking'
    });
  }
}

const notificationService = new NotificationService();
export default notificationService;
