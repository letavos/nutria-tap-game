// Serviço de Sincronização para Nutria Tap PWA
import supabaseApiService from './SupabaseApiService';

class SyncService {
  constructor() {
    this.syncInterval = null;
    this.isOnline = navigator.onLine;
    this.setupOnlineListener();
  }

  // Configurar listener para mudanças de conectividade
  setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Conexão restaurada - iniciando sincronização...');
      this.startAutoSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Conexão perdida - parando sincronização automática');
      this.stopAutoSync();
    });
  }

  // Iniciar sincronização automática
  startAutoSync(interval = 30000) { // 30 segundos
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncAllData();
      }
    }, interval);

    console.log('Sincronização automática iniciada');
  }

  // Parar sincronização automática
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.log('Sincronização automática parada');
  }

  // Sincronizar todos os dados
  async syncAllData() {
    try {
      console.log('Iniciando sincronização completa...');
      
      await Promise.all([
        this.syncUserData(),
        this.syncGameData(),
        this.syncRankingData(),
        this.syncAchievements()
      ]);
      
      console.log('Sincronização completa concluída');
    } catch (error) {
      console.error('Erro na sincronização completa:', error);
    }
  }

  // Sincronizar dados do usuário
  async syncUserData() {
    try {
      const currentUser = JSON.parse(localStorage.getItem('nutriaTap_currentUser') || 'null');
      if (!currentUser) return;

      const result = await supabaseApiService.updateUserProfile(currentUser.id, currentUser);
      if (result.success) {
        console.log('Dados do usuário sincronizados');
      }
    } catch (error) {
      console.error('Erro ao sincronizar dados do usuário:', error);
    }
  }

  // Sincronizar dados do jogo
  async syncGameData() {
    try {
      const gameState = JSON.parse(localStorage.getItem('nutriaGameState') || 'null');
      const currentUser = JSON.parse(localStorage.getItem('nutriaTap_currentUser') || 'null');
      
      if (!gameState || !currentUser) return;

      const gameStats = {
        coins: gameState.coins,
        totalClicks: gameState.totalClicks,
        level: gameState.level,
        maxStreak: gameState.maxStreak,
        achievements: gameState.achievements,
        prestige: gameState.prestige
      };

      const result = await supabaseApiService.updateUserStats(currentUser.id, gameStats);
      if (result.success) {
        console.log('Dados do jogo sincronizados');
      }
    } catch (error) {
      console.error('Erro ao sincronizar dados do jogo:', error);
    }
  }

  // Sincronizar dados de ranking
  async syncRankingData() {
    try {
      const rankingData = await supabaseApiService.getRanking(100);
      if (rankingData && rankingData.length > 0) {
        // Salvar ranking atualizado no IndexedDB
        const { default: indexedDBManager } = await import('../utils/IndexedDBManager');
        await indexedDBManager.init();
        await indexedDBManager.saveRankingData(rankingData);
        
        console.log('Dados de ranking sincronizados');
      }
    } catch (error) {
      console.error('Erro ao sincronizar dados de ranking:', error);
      // Não propagar erro para não quebrar a sincronização completa
    }
  }

  // Sincronizar conquistas
  async syncAchievements() {
    try {
      const currentUser = JSON.parse(localStorage.getItem('nutriaTap_currentUser') || 'null');
      if (!currentUser) return;

      const gameState = JSON.parse(localStorage.getItem('nutriaGameState') || 'null');
      if (!gameState || !gameState.achievements) return;

      // Sincronizar cada conquista
      for (const achievement of gameState.achievements) {
        try {
          await supabaseApiService.submitAchievement(currentUser.id, achievement);
        } catch (error) {
          console.error('Erro ao sincronizar conquista:', error);
        }
      }
      
      console.log('Conquistas sincronizadas');
    } catch (error) {
      console.error('Erro ao sincronizar conquistas:', error);
    }
  }

  // Obter ranking atualizado
  async getUpdatedRanking(sortBy = 'totalCoins') {
    try {
      if (!this.isOnline) {
        // Retornar dados offline
        const { default: indexedDBManager } = await import('../utils/IndexedDBManager');
        await indexedDBManager.init();
        return await indexedDBManager.loadRankingData();
      }

      const ranking = await apiService.getGlobalRanking(sortBy, 100);
      
      // Salvar no IndexedDB para uso offline
      if (ranking && ranking.length > 0) {
        const { default: indexedDBManager } = await import('../utils/IndexedDBManager');
        await indexedDBManager.init();
        await indexedDBManager.saveRankingData(ranking);
      }
      
      return ranking;
    } catch (error) {
      console.error('Erro ao obter ranking atualizado:', error);
      
      // Fallback para dados offline
      try {
        const { default: indexedDBManager } = await import('../utils/IndexedDBManager');
        await indexedDBManager.init();
        return await indexedDBManager.loadRankingData();
      } catch (offlineError) {
        console.error('Erro ao carregar dados offline:', offlineError);
        return [];
      }
    }
  }

  // Obter posição do usuário no ranking
  async getUserRanking(userId, sortBy = 'totalCoins') {
    try {
      if (!this.isOnline) {
        return null;
      }

      return await apiService.getUserRank(userId, sortBy);
    } catch (error) {
      console.error('Erro ao obter posição do usuário:', error);
      return null;
    }
  }

  // Forçar sincronização manual
  async forceSync() {
    try {
      console.log('Sincronização manual iniciada...');
      await this.syncAllData();
      console.log('Sincronização manual concluída');
      return { success: true };
    } catch (error) {
      console.error('Erro na sincronização manual:', error);
      return { success: false, error: error.message };
    }
  }

  // Verificar status de conectividade
  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      autoSyncActive: !!this.syncInterval
    };
  }

  // Configurar intervalo de sincronização
  setSyncInterval(interval) {
    if (this.isOnline) {
      this.startAutoSync(interval);
    }
  }

  // Limpar dados de sincronização
  async clearSyncData() {
    try {
      const { default: indexedDBManager } = await import('../utils/IndexedDBManager');
      await indexedDBManager.init();
      
      // Limpar dados antigos
      await indexedDBManager.cleanupOldData(7); // 7 dias
      
      console.log('Dados de sincronização limpos');
    } catch (error) {
      console.error('Erro ao limpar dados de sincronização:', error);
    }
  }

  // Exportar dados para backup
  async exportData() {
    try {
      const { default: indexedDBManager } = await import('../utils/IndexedDBManager');
      await indexedDBManager.init();
      
      const exportData = await indexedDBManager.exportData();
      
      // Adicionar informações de sincronização
      exportData.syncInfo = {
        lastSync: new Date().toISOString(),
        isOnline: this.isOnline,
        version: '1.0.0'
      };
      
      return exportData;
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      return null;
    }
  }

  // Importar dados de backup
  async importData(importData) {
    try {
      const { default: indexedDBManager } = await import('../utils/IndexedDBManager');
      await indexedDBManager.init();
      
      const success = await indexedDBManager.importData(importData);
      
      if (success) {
        // Sincronizar dados importados
        await this.syncAllData();
        console.log('Dados importados e sincronizados');
      }
      
      return success;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  }
}

// Instância singleton
const syncService = new SyncService();

export default syncService;
