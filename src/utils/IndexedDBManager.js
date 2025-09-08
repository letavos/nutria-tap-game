// Gerenciador de IndexedDB para Nutria Tap PWA
class IndexedDBManager {
  constructor() {
    this.dbName = 'NutriaTapDB';
    this.version = 1;
    this.db = null;
  }

  // Inicializar o banco de dados
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Erro ao abrir IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB inicializado com sucesso');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Store para dados do jogo
        if (!db.objectStoreNames.contains('gameData')) {
          const gameStore = db.createObjectStore('gameData', { keyPath: 'id' });
          gameStore.createIndex('timestamp', 'timestamp', { unique: false });
          gameStore.createIndex('type', 'type', { unique: false });
        }

        // Store para dados de usuário
        if (!db.objectStoreNames.contains('userData')) {
          const userStore = db.createObjectStore('userData', { keyPath: 'id' });
          userStore.createIndex('username', 'username', { unique: true });
          userStore.createIndex('email', 'email', { unique: true });
        }

        // Store para ranking
        if (!db.objectStoreNames.contains('rankingData')) {
          const rankingStore = db.createObjectStore('rankingData', { keyPath: 'id' });
          rankingStore.createIndex('score', 'score', { unique: false });
          rankingStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store para configurações
        if (!db.objectStoreNames.contains('settings')) {
          const settingsStore = db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Store para cache de assets
        if (!db.objectStoreNames.contains('assets')) {
          const assetsStore = db.createObjectStore('assets', { keyPath: 'url' });
          assetsStore.createIndex('type', 'type', { unique: false });
        }

        // Store para dados offline
        if (!db.objectStoreNames.contains('offlineData')) {
          const offlineStore = db.createObjectStore('offlineData', { keyPath: 'id' });
          offlineStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        console.log('Estrutura do IndexedDB criada');
      };
    });
  }

  // Salvar dados do jogo
  async saveGameData(gameState) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['gameData'], 'readwrite');
      const store = transaction.objectStore('gameData');
      
      const gameData = {
        id: 'currentGame',
        data: gameState,
        timestamp: Date.now(),
        type: 'gameState',
        version: '1.0.0'
      };

      const request = store.put(gameData);

      request.onsuccess = () => {
        console.log('Dados do jogo salvos no IndexedDB');
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Erro ao salvar dados do jogo:', request.error);
        reject(request.error);
      };
    });
  }

  // Carregar dados do jogo
  async loadGameData() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['gameData'], 'readonly');
      const store = transaction.objectStore('gameData');
      const request = store.get('currentGame');

      request.onsuccess = () => {
        if (request.result) {
          console.log('Dados do jogo carregados do IndexedDB');
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('Erro ao carregar dados do jogo:', request.error);
        reject(request.error);
      };
    });
  }

  // Salvar dados do usuário
  async saveUserData(userData) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['userData'], 'readwrite');
      const store = transaction.objectStore('userData');
      
      const user = {
        id: userData.id || 'currentUser',
        ...userData,
        timestamp: Date.now()
      };

      const request = store.put(user);

      request.onsuccess = () => {
        console.log('Dados do usuário salvos no IndexedDB');
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Erro ao salvar dados do usuário:', request.error);
        reject(request.error);
      };
    });
  }

  // Carregar dados do usuário
  async loadUserData() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['userData'], 'readonly');
      const store = transaction.objectStore('userData');
      const request = store.get('currentUser');

      request.onsuccess = () => {
        if (request.result) {
          console.log('Dados do usuário carregados do IndexedDB');
          resolve(request.result);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('Erro ao carregar dados do usuário:', request.error);
        reject(request.error);
      };
    });
  }

  // Salvar dados de ranking
  async saveRankingData(rankingData) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['rankingData'], 'readwrite');
      const store = transaction.objectStore('rankingData');
      
      const ranking = {
        id: 'currentRanking',
        data: rankingData,
        timestamp: Date.now()
      };

      const request = store.put(ranking);

      request.onsuccess = () => {
        console.log('Dados de ranking salvos no IndexedDB');
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Erro ao salvar dados de ranking:', request.error);
        reject(request.error);
      };
    });
  }

  // Carregar dados de ranking
  async loadRankingData() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['rankingData'], 'readonly');
      const store = transaction.objectStore('rankingData');
      const request = store.get('currentRanking');

      request.onsuccess = () => {
        if (request.result) {
          console.log('Dados de ranking carregados do IndexedDB');
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('Erro ao carregar dados de ranking:', request.error);
        reject(request.error);
      };
    });
  }

  // Salvar configurações
  async saveSettings(settings) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      
      const settingsData = {
        key: 'appSettings',
        data: settings,
        timestamp: Date.now()
      };

      const request = store.put(settingsData);

      request.onsuccess = () => {
        console.log('Configurações salvas no IndexedDB');
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Erro ao salvar configurações:', request.error);
        reject(request.error);
      };
    });
  }

  // Carregar configurações
  async loadSettings() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get('appSettings');

      request.onsuccess = () => {
        if (request.result) {
          console.log('Configurações carregadas do IndexedDB');
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('Erro ao carregar configurações:', request.error);
        reject(request.error);
      };
    });
  }

  // Cache de assets
  async cacheAsset(url, data, type) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      
      const asset = {
        url: url,
        data: data,
        type: type,
        timestamp: Date.now()
      };

      const request = store.put(asset);

      request.onsuccess = () => {
        console.log('Asset cacheado:', url);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Erro ao cachear asset:', request.error);
        reject(request.error);
      };
    });
  }

  // Carregar asset do cache
  async loadCachedAsset(url) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['assets'], 'readonly');
      const store = transaction.objectStore('assets');
      const request = store.get(url);

      request.onsuccess = () => {
        if (request.result) {
          console.log('Asset carregado do cache:', url);
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('Erro ao carregar asset do cache:', request.error);
        reject(request.error);
      };
    });
  }

  // Marcar dados para sincronização offline
  async markForOfflineSync(data, type) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      const offlineData = {
        id: `${type}_${Date.now()}`,
        data: data,
        type: type,
        syncStatus: 'pending',
        timestamp: Date.now()
      };

      const request = store.put(offlineData);

      request.onsuccess = () => {
        console.log('Dados marcados para sincronização offline:', type);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Erro ao marcar dados para sincronização:', request.error);
        reject(request.error);
      };
    });
  }

  // Limpar dados antigos
  async cleanupOldData(daysOld = 30) {
    if (!this.db) await this.init();

    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['gameData', 'rankingData', 'assets'], 'readwrite');
      
      const stores = ['gameData', 'rankingData', 'assets'];
      let completed = 0;

      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const index = store.index('timestamp');
        const range = IDBKeyRange.upperBound(cutoffTime);
        const request = index.openCursor(range);

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            completed++;
            if (completed === stores.length) {
              console.log('Limpeza de dados antigos concluída');
              resolve();
            }
          }
        };

        request.onerror = () => {
          console.error('Erro na limpeza de dados:', request.error);
          reject(request.error);
        };
      });
    });
  }

  // Exportar dados para backup
  async exportData() {
    if (!this.db) await this.init();

    const exportData = {
      gameData: await this.loadGameData(),
      userData: await this.loadUserData(),
      rankingData: await this.loadRankingData(),
      settings: await this.loadSettings(),
      timestamp: Date.now(),
      version: '1.0.0'
    };

    return exportData;
  }

  // Importar dados de backup
  async importData(importData) {
    if (!this.db) await this.init();

    try {
      if (importData.gameData) {
        await this.saveGameData(importData.gameData);
      }
      if (importData.userData) {
        await this.saveUserData(importData.userData);
      }
      if (importData.rankingData) {
        await this.saveRankingData(importData.rankingData);
      }
      if (importData.settings) {
        await this.saveSettings(importData.settings);
      }

      console.log('Dados importados com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  }
}

// Instância singleton
const indexedDBManager = new IndexedDBManager();

export default indexedDBManager;
