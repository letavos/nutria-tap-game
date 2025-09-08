// Serviço de API para Nutria Tap PWA
class ApiService {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://nutria-tap-api.vercel.app/api' 
      : 'http://localhost:3001/api';
    this.isOnline = navigator.onLine;
    this.setupOnlineListener();
  }

  // Configurar listener para mudanças de conectividade
  setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Conexão restaurada - sincronizando dados...');
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Conexão perdida - modo offline ativado');
    });
  }

  // Verificar se está online
  async checkConnection() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Fazer requisição com retry e fallback offline
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    };

    const requestOptions = { ...defaultOptions, ...options };

    try {
      if (!this.isOnline) {
        throw new Error('Offline');
      }

      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erro na requisição ${endpoint}:`, error);
      
      // Se offline, tentar carregar dados do cache
      if (!this.isOnline || error.message === 'Offline') {
        return this.getOfflineData(endpoint);
      }
      
      throw error;
    }
  }

  // Obter dados offline do IndexedDB
  async getOfflineData(endpoint) {
    try {
      const { default: indexedDBManager } = await import('../utils/IndexedDBManager');
      await indexedDBManager.init();
      
      if (endpoint.includes('/ranking')) {
        return await indexedDBManager.loadRankingData();
      } else if (endpoint.includes('/user')) {
        return await indexedDBManager.loadUserData();
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao carregar dados offline:', error);
      return null;
    }
  }

  // Salvar dados offline para sincronização posterior
  async saveOfflineData(endpoint, data) {
    try {
      const { default: indexedDBManager } = await import('../utils/IndexedDBManager');
      await indexedDBManager.init();
      
      if (endpoint.includes('/ranking')) {
        await indexedDBManager.saveRankingData(data);
      } else if (endpoint.includes('/user')) {
        await indexedDBManager.saveUserData(data);
      }
      
      // Marcar para sincronização
      await indexedDBManager.markForOfflineSync(data, endpoint);
    } catch (error) {
      console.error('Erro ao salvar dados offline:', error);
    }
  }

  // === RANKING API ===

  // Obter ranking global
  async getGlobalRanking(sortBy = 'totalCoins', limit = 100) {
    try {
      const data = await this.makeRequest(`/ranking/global?sortBy=${sortBy}&limit=${limit}`);
      return data;
    } catch (error) {
      console.error('Erro ao obter ranking global:', error);
      return [];
    }
  }

  // Obter ranking por categoria
  async getRankingByCategory(category, limit = 50) {
    try {
      const data = await this.makeRequest(`/ranking/category/${category}?limit=${limit}`);
      return data;
    } catch (error) {
      console.error('Erro ao obter ranking por categoria:', error);
      return [];
    }
  }

  // Submeter pontuação do usuário
  async submitScore(userData, gameStats) {
    const payload = {
      userId: userData.id,
      username: userData.username,
      email: userData.email,
      wallet: userData.wallet,
      stats: {
        totalCoins: gameStats.coins,
        totalClicks: gameStats.totalClicks,
        level: gameStats.level,
        maxStreak: gameStats.maxStreak,
        achievements: gameStats.achievements.length,
        prestigeLevel: gameStats.prestige?.level || 0,
        lastUpdate: new Date().toISOString()
      }
    };

    try {
      const data = await this.makeRequest('/ranking/submit', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao submeter pontuação:', error);
      
      // Salvar offline para sincronização posterior
      await this.saveOfflineData('/ranking/submit', payload);
      
      return { success: false, offline: true, message: 'Dados salvos offline para sincronização' };
    }
  }

  // Obter posição do usuário no ranking
  async getUserRank(userId, sortBy = 'totalCoins') {
    try {
      const data = await this.makeRequest(`/ranking/user/${userId}?sortBy=${sortBy}`);
      return data;
    } catch (error) {
      console.error('Erro ao obter posição do usuário:', error);
      return null;
    }
  }

  // === USER API ===

  // Registrar novo usuário
  async registerUser(userData) {
    const payload = {
      username: userData.username,
      email: userData.email,
      wallet: userData.wallet,
      stats: userData.stats || {},
      createdAt: new Date().toISOString()
    };

    try {
      const data = await this.makeRequest('/user/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      
      // Salvar offline para sincronização posterior
      await this.saveOfflineData('/user/register', payload);
      
      return { success: false, offline: true, message: 'Usuário salvo offline para sincronização' };
    }
  }

  // Atualizar dados do usuário
  async updateUser(userId, userData) {
    const payload = {
      ...userData,
      lastUpdate: new Date().toISOString()
    };

    try {
      const data = await this.makeRequest(`/user/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      
      // Salvar offline para sincronização posterior
      await this.saveOfflineData(`/user/${userId}`, payload);
      
      return { success: false, offline: true, message: 'Dados salvos offline para sincronização' };
    }
  }

  // Obter dados do usuário
  async getUser(userId) {
    try {
      const data = await this.makeRequest(`/user/${userId}`);
      return data;
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      return null;
    }
  }

  // Verificar se username está disponível
  async checkUsernameAvailability(username) {
    try {
      const data = await this.makeRequest(`/user/check-username/${username}`);
      return data.available;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade do username:', error);
      return true; // Assumir disponível se offline
    }
  }

  // === SYNC API ===

  // Sincronizar dados offline
  async syncOfflineData() {
    try {
      const { default: indexedDBManager } = await import('../utils/IndexedDBManager');
      await indexedDBManager.init();
      
      // Obter dados pendentes de sincronização
      const pendingData = await this.getPendingSyncData();
      
      for (const data of pendingData) {
        try {
          await this.makeRequest(data.endpoint, {
            method: data.method || 'POST',
            body: JSON.stringify(data.payload)
          });
          
          // Marcar como sincronizado
          await this.markAsSynced(data.id);
        } catch (error) {
          console.error('Erro ao sincronizar dados:', error);
        }
      }
      
      console.log('Sincronização offline concluída');
    } catch (error) {
      console.error('Erro na sincronização offline:', error);
    }
  }

  // Obter dados pendentes de sincronização
  async getPendingSyncData() {
    try {
      const { default: indexedDBManager } = await import('../utils/IndexedDBManager');
      await indexedDBManager.init();
      
      // Implementar busca de dados pendentes no IndexedDB
      return [];
    } catch (error) {
      console.error('Erro ao obter dados pendentes:', error);
      return [];
    }
  }

  // Marcar dados como sincronizados
  async markAsSynced(dataId) {
    try {
      const { default: indexedDBManager } = await import('../utils/IndexedDBManager');
      await indexedDBManager.init();
      
      // Implementar marcação de dados como sincronizados
      console.log('Dados marcados como sincronizados:', dataId);
    } catch (error) {
      console.error('Erro ao marcar dados como sincronizados:', error);
    }
  }

  // === ACHIEVEMENTS API ===

  // Obter conquistas do usuário
  async getUserAchievements(userId) {
    try {
      const data = await this.makeRequest(`/achievements/user/${userId}`);
      return data;
    } catch (error) {
      console.error('Erro ao obter conquistas do usuário:', error);
      return [];
    }
  }

  // Submeter nova conquista
  async submitAchievement(userId, achievement) {
    const payload = {
      userId,
      achievement,
      timestamp: new Date().toISOString()
    };

    try {
      const data = await this.makeRequest('/achievements/submit', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao submeter conquista:', error);
      
      // Salvar offline para sincronização posterior
      await this.saveOfflineData('/achievements/submit', payload);
      
      return { success: false, offline: true };
    }
  }

  // === LEADERBOARDS API ===

  // Obter leaderboards especiais
  async getSpecialLeaderboards() {
    try {
      const data = await this.makeRequest('/leaderboards/special');
      return data;
    } catch (error) {
      console.error('Erro ao obter leaderboards especiais:', error);
      return [];
    }
  }

  // Obter estatísticas globais
  async getGlobalStats() {
    try {
      const data = await this.makeRequest('/stats/global');
      return data;
    } catch (error) {
      console.error('Erro ao obter estatísticas globais:', error);
      return null;
    }
  }
}

// Instância singleton
const apiService = new ApiService();

export default apiService;
