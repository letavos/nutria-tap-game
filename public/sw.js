// Service Worker para Nutria Tap PWA
const CACHE_NAME = 'nutria-tap-v1.0.0';
const STATIC_CACHE = 'nutria-static-v1';
const DYNAMIC_CACHE = 'nutria-dynamic-v1';

// Arquivos essenciais para cache
const STATIC_FILES = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/App.css',
  '/src/index.css',
  '/src/components/NutriaGame.jsx',
  '/src/components/NutriaClicker.jsx',
  '/src/context/GameContext.jsx',
  '/src/context/LanguageContext.jsx',
  '/src/context/UserContext.jsx',
  '/src/assets/nutria_1.png',
  '/src/assets/nutria_2.png',
  '/src/assets/nutria_3.png',
  '/manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégia Cache First para arquivos estáticos
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image' ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.svg')) {
    
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request)
            .then((fetchResponse) => {
              if (fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return fetchResponse;
            });
        })
        .catch(() => {
          // Fallback para páginas offline
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
        })
    );
  }
  
  // Estratégia Network First para dados dinâmicos
  else if (url.pathname.includes('/api/') || url.pathname.includes('/ranking/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then((response) => {
              if (response) {
                return response;
              }
              // Retornar dados offline padrão
              return new Response(JSON.stringify({
                offline: true,
                message: 'Dados offline disponíveis'
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
  }
});

// Background Sync para sincronização offline
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'game-sync') {
    event.waitUntil(syncGameData());
  }
  
  if (event.tag === 'ranking-sync') {
    event.waitUntil(syncRankingData());
  }
  
  if (event.tag === 'user-sync') {
    event.waitUntil(syncUserData());
  }
  
  if (event.tag === 'achievement-sync') {
    event.waitUntil(syncAchievements());
  }
});

// Função para sincronizar dados do jogo
async function syncGameData() {
  try {
    const gameData = await getStoredGameData();
    if (gameData) {
      const response = await fetch('/api/game/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData)
      });
      
      if (response.ok) {
        console.log('[SW] Game data synced successfully');
        await clearStoredGameData();
      }
    }
  } catch (error) {
    console.error('[SW] Game sync failed:', error);
  }
}

// Função para sincronizar dados de ranking
async function syncRankingData() {
  try {
    const rankingData = await getStoredRankingData();
    if (rankingData) {
      const response = await fetch('/api/ranking/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rankingData)
      });
      
      if (response.ok) {
        console.log('[SW] Ranking data synced successfully');
        await clearStoredRankingData();
      }
    }
  } catch (error) {
    console.error('[SW] Ranking sync failed:', error);
  }
}

// Funções auxiliares para IndexedDB
async function getStoredGameData() {
  return new Promise((resolve) => {
    const request = indexedDB.open('NutriaTapDB', 1);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['gameData'], 'readonly');
      const store = transaction.objectStore('gameData');
      const getRequest = store.get('pendingSync');
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result);
      };
    };
  });
}

async function clearStoredGameData() {
  return new Promise((resolve) => {
    const request = indexedDB.open('NutriaTapDB', 1);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['gameData'], 'readwrite');
      const store = transaction.objectStore('gameData');
      store.delete('pendingSync');
      resolve();
    };
  });
}

async function getStoredRankingData() {
  return new Promise((resolve) => {
    const request = indexedDB.open('NutriaTapDB', 1);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['rankingData'], 'readonly');
      const store = transaction.objectStore('rankingData');
      const getRequest = store.get('pendingSync');
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result);
      };
    };
  });
}

async function clearStoredRankingData() {
  return new Promise((resolve) => {
    const request = indexedDB.open('NutriaTapDB', 1);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['rankingData'], 'readwrite');
      const store = transaction.objectStore('rankingData');
      store.delete('pendingSync');
      resolve();
    };
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nova recompensa disponível!',
    icon: '/src/assets/nutria_1.png',
    badge: '/src/assets/nutria_1.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir Jogo',
        icon: '/src/assets/nutria_1.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/src/assets/nutria_1.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Nutria Tap', options)
  );
});

// Click em notificações
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
