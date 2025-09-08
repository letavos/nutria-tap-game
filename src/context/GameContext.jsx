import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import indexedDBManager from '../utils/IndexedDBManager';
import notificationService from '../services/NotificationService';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';

const GameContext = createContext();

const MAX_LEVEL = 10;
const getNutriaImage = (level) => `./src/assets/nutria_${Math.min(level, MAX_LEVEL)}.png`;
const getExpToNextLevel = (level) => Math.floor(100 * Math.pow(level, 1.7));

const getAchievements = (t) => [
  { id: 'streak5', name: t('streak5'), desc: t('make5QuickClicks'), category: 'streak' },
  { id: 'streak10', name: t('streak10'), desc: t('make10QuickClicks'), category: 'streak' },
  { id: 'streak25', name: t('streak25'), desc: t('make25QuickClicks'), category: 'streak' },
  { id: 'coins100', name: t('coins100'), desc: t('collect100Coins'), category: 'riqueza' },
  { id: 'coins1000', name: t('coins1000'), desc: t('collect1000Coins'), category: 'riqueza' },
  { id: 'coins5000', name: t('coins5000'), desc: t('collect5000Coins'), category: 'riqueza' },
  { id: 'upgrade1', name: t('firstUpgrade'), desc: t('buyFirstUpgrade'), category: 'progresso' },
  { id: 'upgrade5', name: t('upgrade5'), desc: t('buy5Upgrades'), category: 'progresso' },
  { id: 'level5', name: t('level5'), desc: t('reachLevel5'), category: 'progresso' },
  { id: 'level10', name: t('level10'), desc: t('reachLevel10'), category: 'progresso' },
  { id: 'referral1', name: t('firstReferral'), desc: t('bringFriend'), category: 'social' },
  { id: 'skinUnlock', name: t('firstSkin'), desc: t('unlockSkin'), category: 'events' },
  { id: 'airdrop100', name: t('airdrop100'), desc: t('reach100Airdrop'), category: 'events' },
  { id: 'day7', name: t('day7'), desc: t('play7Days'), category: 'progresso' },
  { id: 'conquista_natal', name: t('conquista_natal'), desc: t('participateNatal'), category: 'events', eventId: 'natal2024' },
  { id: 'conquista_carnaval', name: t('conquista_carnaval'), desc: t('participateCarnaval'), category: 'events', eventId: 'carnaval2025' },
];

// Estrutura de missões diárias e semanais
const getDailyMissions = (t) => [
  { id: 'click50', desc: t('feedNutria50'), type: 'daily', goal: 50, reward: 25, progressKey: 'daily_clicks' },
  { id: 'badge1', desc: t('conquer1Badge'), type: 'daily', goal: 1, reward: 15, progressKey: 'daily_badges' },
];
const getWeeklyMissions = (t) => [
  { id: 'streak100', desc: t('make100Streaks'), type: 'weekly', goal: 100, reward: 100, progressKey: 'weekly_streaks' },
  { id: 'refer1', desc: t('bring1Friend'), type: 'weekly', goal: 1, reward: 50, progressKey: 'weekly_referrals' },
];

// Estrutura de eventos sazonais
const getSeasonalEvents = (t) => [
  {
    id: 'natal2024',
    name: t('natalNutria'),
    desc: t('natalNutriaDesc'),
    start: '2024-12-20',
    end: '2024-12-27',
    rewards: ['skin_natal', 'badge_natal', 'conquista_natal'],
    color: '#2ecc71',
    banner: `🎄 ${t('natalNutria')}! 🎁`,
  },
  {
    id: 'carnaval2025',
    name: t('carnavalNutria'),
    desc: t('carnavalNutriaDesc'),
    start: '2025-02-25',
    end: '2025-03-05',
    rewards: ['skin_carnaval', 'badge_carnaval'],
    color: '#f39c12',
    banner: `🎉 ${t('carnavalNutria')}! 🎭`,
  },
];

// Estrutura de títulos
const getTitles = (t) => [
  { id: 'starter', name: t('beginner'), desc: t('startJourney'), unlock: state => true },
  { id: 'streaker', name: 'Streaker', desc: t('makeStreak10'), unlock: state => state.achievements.includes('streak10') },
  { id: 'veteran', name: t('veteran'), desc: t('play7Days'), unlock: state => state.achievements.includes('day7') },
  { id: 'top3', name: 'Top 3', desc: t('top3Ranking'), unlock: (state, getRank) => getRank() <= 3 },
  { id: 'event_natal', name: t('natalino'), desc: t('participateNatal'), unlock: (state, _, isEventActive) => isEventActive('natal2024') },
];

// Paleta de cores seguras para personalização
const getCircleColors = (t) => [
  { id: 'green', label: t('green'), value: '#2ecc71' },
  { id: 'orange', label: t('orange'), value: '#f39c12' },
  { id: 'blue', label: t('blue'), value: '#3498db' },
  { id: 'purple', label: t('purple'), value: '#8e44ad' },
  { id: 'pink', label: t('pink'), value: '#e84393' },
  { id: 'gold', label: t('gold'), value: '#ffd700' },
  { id: 'dark', label: t('dark'), value: '#23272f' },
  { id: 'light', label: t('light'), value: '#f4f8fb' },
];
const getBorderStyles = (t) => [
  { id: 'pulse', label: t('pulse') },
  { id: 'glow', label: t('glow') },
  { id: 'gradient', label: t('gradient') },
  { id: 'static', label: t('static') },
];
const getBgStyles = (t) => [
  { id: 'default', label: t('default') },
  { id: 'gradient1', label: t('greenOrangeGradient') },
  { id: 'gradient2', label: t('bluePurpleGradient') },
  { id: 'dark', label: t('dark') },
  { id: 'light', label: t('light') },
];
const getEffects = (t) => [
  { id: 'none', label: t('noEffect') },
  { id: 'particles', label: t('particles') },
  { id: 'shine', label: t('shine') },
];

const getDefaultCustomization = () => ({
  circleColor: 'green',
  borderStyle: 'pulse',
  backgroundStyle: 'default',
  effects: 'none',
});

function getToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function getTodayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function getWeekKey() {
  const d = new Date();
  const first = d.getDate() - d.getDay();
  const week = new Date(d.setDate(first));
  return week.toISOString().slice(0, 10);
}

function calcAirdropPoints(state) {
  // Pontos por clique (0.5 por clique)
  const clickPoints = Math.floor(state.totalClicks * 0.5);
  // Pontos por nível
  const levelPoints = state.level * 10;
  // Pontos por conquista
  const achPoints = state.achievements.length * 7;
  // Pontos por upgrades
  const upgradePoints = (state.upgrades.clickUpgrade.level - 1) * 3;
  // Pontos por streaks de 10
  const streakBonus = Math.floor(state.maxStreak / 10) * 5;
  // Pontos por referidos ativos (>=50 cliques)
  const activeReferrals = (state.referralStats || []).filter(r => r.clicks >= 50).length;
  const referralPoints = activeReferrals * 15;
  // Pontos por dias ativos
  const daysActive = (state.daysActive || []).length;
  const dailyBonus = daysActive * 10;
  return clickPoints + levelPoints + achPoints + upgradePoints + streakBonus + referralPoints + dailyBonus;
}

function getActiveEvent() {
  const today = new Date().toISOString().slice(0, 10);
  return getSeasonalEvents(() => '').find(ev => today >= ev.start && today <= ev.end) || null;
}

// Função para verificar se um evento está ativo
function isEventActive(eventId) {
  const ev = getSeasonalEvents(() => '').find(e => e.id === eventId);
  if (!ev) return false;
  const today = new Date().toISOString().slice(0, 10);
  return today >= ev.start && today <= ev.end;
}

export const INITIAL_STATE = {
  coins: 0,
  clickValue: 1,
  level: 1,
  experience: 0,
  experienceToNextLevel: getExpToNextLevel(1),
  nutriaImage: getNutriaImage(1),
  streak: 0,
  maxStreak: 0,
  lastClick: 0,
  totalClicks: 0,
  daysActive: [],
  stats: {
    strength: 1,
    agility: 1,
    defense: 1,
    charisma: 1
  },
  upgrades: {
    clickUpgrade: {
      level: 1,
      cost: 10,
      value: 1
    },
    autoClicker: {
      level: 0,
      cost: 100,
      value: 0.1,
      interval: 1000,
      active: false
    },
    multiplier: {
      level: 0,
      cost: 500,
      value: 1.5,
      duration: 30000
    },
    prestige: {
      level: 0,
      cost: 10000,
      multiplier: 1.1
    }
  },
  // Sistema de Prestígio
  prestige: {
    level: 0,
    points: 0,
    totalPrestige: 0,
    multipliers: {
      coins: 1,
      experience: 1,
      upgrades: 1
    }
  },
  // Sistema de Energia/Estamina
  energy: {
    current: 100,
    max: 100,
    lastUpdate: Date.now(),
    recoveryRate: 1, // energia por minuto
    clickCost: 1, // energia gasta por clique
    isRecovering: true
  },
  // Sistema Anti-Cheat
  antiCheat: {
    lastClickTime: 0,
    clickCount: 0,
    maxClicksPerSecond: 10,
    suspiciousActivity: false
  },
  // Sistema de Bônus Temporários
  activeBonuses: [],
  // Sistema de Recompensas
  rewards: {
    daily: {
      streak: 0,
      lastClaim: null,
      available: true,
      lastClaimTimestamp: null
    },
    weekly: {
      lastClaim: null,
      available: true,
      lastClaimTimestamp: null
    },
    monthly: {
      lastClaim: null,
      available: true,
      lastClaimTimestamp: null
    },
    login: {
      claimed: [],
      lastClaim: null,
      lastClaimTimestamp: null
    }
  },
  // Sistema de Desafios
  challenges: {
    active: [],
    completed: [],
    rewards: []
  },
  // Sistema de Eventos Dinâmicos
  dynamicEvents: {
    active: [],
    history: []
  },
  referralId: '',
  referrals: [],
  referralStats: [],
  achievements: [],
  airdropPoints: 0,
  missions: {
    daily: getDailyMissions(() => '').map(m => ({ ...m, progress: 0, completed: false })),
    weekly: getWeeklyMissions(() => '').map(m => ({ ...m, progress: 0, completed: false })),
    lastDaily: getTodayKey(),
    lastWeekly: getWeekKey(),
  },
  seasonalEvent: getActiveEvent(),
  titles: getTitles(() => '').map(t => ({ ...t, unlocked: false })),
  equippedTitle: 'starter',
  customization: { ...getDefaultCustomization() },
};

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState(INITIAL_STATE);
  const [levelUpEffect, setLevelUpEffect] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('nutriaTheme') || 'auto');
  const [prestigeMessage, setPrestigeMessage] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // Função para sincronizar dados com Supabase
  const syncToSupabase = async (updatedState) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const gameStats = {
        user_id: user.id,
        total_coins: updatedState.coins,
        total_clicks: updatedState.totalClicks,
        level: updatedState.level,
        experience: updatedState.experience,
        prestige_level: updatedState.prestige.level,
        streak: updatedState.streak,
        max_streak: Math.max(updatedState.streak, updatedState.maxStreak || 0),
        total_achievements: updatedState.achievements.length,
        last_click: new Date().toISOString(),
        last_sync: new Date().toISOString()
      };

      const { error } = await supabase
        .from('game_stats')
        .upsert(gameStats, { onConflict: 'user_id' });

      if (error) {
        console.error('Erro ao sincronizar com Supabase:', error);
      } else {
        console.log('Dados sincronizados com Supabase:', gameStats);
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
    }
  };
  
  // Função para sincronizar referralId do banco de dados
  const syncReferralIdFromDB = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: userData } = await supabase
        .from('users')
        .select('referral_id')
        .eq('id', user.id)
        .single();
      
      return userData?.referral_id || null;
    } catch (error) {
      console.error('Erro ao buscar referral_id do banco:', error);
      return null;
    }
  };

  // ===== SISTEMA DE NOTIFICAÇÕES =====
  
  // Adicionar notificação
  const addNotification = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    // Remover automaticamente após a duração
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  };

  // Remover notificação
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Limpar todas as notificações
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Inicializar IndexedDB e carregar dados
  useEffect(() => {
    const initializeGame = async () => {
      try {
        // Inicializar IndexedDB
        await indexedDBManager.init();
        
        // Buscar referralId do banco de dados
        const referralIdFromDB = await syncReferralIdFromDB();
        console.log('Referral ID do banco:', referralIdFromDB);
        
        const savedCustomization = localStorage.getItem('nutriaCustomization');
        console.log('Carregando configurações salvas:', savedCustomization);
        
        // Carregar configurações de personalização primeiro
        let loadedCustomization = getDefaultCustomization();
        if (savedCustomization) {
          try {
            const parsedCustomization = JSON.parse(savedCustomization);
            loadedCustomization = { ...getDefaultCustomization(), ...parsedCustomization };
            console.log('Configurações carregadas:', loadedCustomization);
          } catch (error) {
            console.error('Erro ao carregar configurações:', error);
          }
        }
        
        // Tentar carregar do IndexedDB primeiro
        const savedGameState = await indexedDBManager.loadGameData();
        if (savedGameState) {
          console.log('Estado do jogo carregado do IndexedDB:', savedGameState);
          setGameState({
            ...INITIAL_STATE,
            ...savedGameState,
            referralId: referralIdFromDB || savedGameState.referralId || INITIAL_STATE.referralId,
            rewards: savedGameState.rewards || INITIAL_STATE.rewards,
            activeBonuses: savedGameState.activeBonuses || INITIAL_STATE.activeBonuses,
            prestige: savedGameState.prestige || INITIAL_STATE.prestige,
            challenges: savedGameState.challenges || INITIAL_STATE.challenges,
            dynamicEvents: savedGameState.dynamicEvents || INITIAL_STATE.dynamicEvents,
            customization: loadedCustomization
          });
        } else {
          // Fallback para localStorage
    const savedState = localStorage.getItem('nutriaGameState');
    if (savedState) {
            const parsedState = JSON.parse(savedState);
            console.log('Estado do jogo carregado do localStorage:', parsedState);
            
            const finalState = {
              ...INITIAL_STATE,
              ...parsedState,
              referralId: referralIdFromDB || parsedState.referralId || INITIAL_STATE.referralId,
              rewards: parsedState.rewards || INITIAL_STATE.rewards,
              activeBonuses: parsedState.activeBonuses || INITIAL_STATE.activeBonuses,
              prestige: parsedState.prestige || INITIAL_STATE.prestige,
              challenges: parsedState.challenges || INITIAL_STATE.challenges,
              dynamicEvents: parsedState.dynamicEvents || INITIAL_STATE.dynamicEvents,
              customization: loadedCustomization
            };
            
            setGameState(finalState);
            // Migrar para IndexedDB
            await indexedDBManager.saveGameData(finalState);
    } else {
            // Se não existir estado salvo, usa o ID do banco ou gera um novo
            const finalReferralId = referralIdFromDB || uuidv4().substring(0, 8);
      setGameState(prev => ({
        ...prev,
              referralId: finalReferralId,
              customization: loadedCustomization
      }));
    }
        }
      } catch (error) {
        console.error('Erro ao inicializar IndexedDB:', error);
        // Fallback para localStorage
        const savedState = localStorage.getItem('nutriaGameState');
        const savedCustomization = localStorage.getItem('nutriaCustomization');
        
        let loadedCustomization = getDefaultCustomization();
        if (savedCustomization) {
          try {
            const parsedCustomization = JSON.parse(savedCustomization);
            loadedCustomization = { ...getDefaultCustomization(), ...parsedCustomization };
          } catch (error) {
            console.error('Erro ao carregar configurações:', error);
          }
        }
        
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          setGameState({
            ...INITIAL_STATE,
            ...parsedState,
            referralId: referralIdFromDB || parsedState.referralId || INITIAL_STATE.referralId,
            rewards: parsedState.rewards || INITIAL_STATE.rewards,
            activeBonuses: parsedState.activeBonuses || INITIAL_STATE.activeBonuses,
            prestige: parsedState.prestige || INITIAL_STATE.prestige,
            challenges: parsedState.challenges || INITIAL_STATE.challenges,
            dynamicEvents: parsedState.dynamicEvents || INITIAL_STATE.dynamicEvents,
            customization: loadedCustomization
          });
    } else {
          const finalReferralId = referralIdFromDB || uuidv4().substring(0, 8);
      setGameState(prev => ({
        ...prev,
            referralId: finalReferralId,
            customization: loadedCustomization
      }));
    }
      }
    };

    initializeGame();
  }, []);

  // Salva o estado do jogo no IndexedDB e localStorage sempre que ele mudar
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (gameState.coins > 0 || gameState.level > 1 || gameState.achievements.length > 0) {
        console.log('Salvando gameState completo:', gameState);
        
        // Salvar no localStorage como backup
      localStorage.setItem('nutriaGameState', JSON.stringify(gameState));
        
        // Salvar no IndexedDB
        try {
          await indexedDBManager.saveGameData(gameState);
          console.log('Dados salvos no IndexedDB com sucesso');
        } catch (error) {
          console.error('Erro ao salvar no IndexedDB:', error);
        }
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [gameState.coins, gameState.level, gameState.achievements.length, JSON.stringify(gameState.customization)]);

  // Sistema de Recuperação de Energia
  useEffect(() => {
    const energyInterval = setInterval(() => {
      setGameState(prev => {
        const now = Date.now();
        const timeDiff = (now - prev.energy.lastUpdate) / 1000 / 60; // minutos
        const energyToAdd = Math.floor(timeDiff * prev.energy.recoveryRate);
        const newEnergy = Math.min(prev.energy.max, prev.energy.current + energyToAdd);
        
        return {
          ...prev,
          energy: {
            ...prev.energy,
            current: newEnergy,
            lastUpdate: now,
            isRecovering: newEnergy < prev.energy.max
          }
        };
      });
    }, 60000); // Atualizar energia a cada minuto

    return () => clearInterval(energyInterval);
  }, []);

  // Sistema de Auto-Clicker
  useEffect(() => {
    if (gameState.upgrades?.autoClicker?.level > 0 && gameState.upgrades?.autoClicker?.active) {
      const interval = setInterval(() => {
        setGameState(prev => {
          const autoClicker = prev.upgrades?.autoClicker;
          const activeBonuses = prev.activeBonuses || [];
          const prestige = prev.prestige || INITIAL_STATE.prestige;
          
          if (!autoClicker) return prev;
          
          const bonusMultiplier = activeBonuses
            .filter(b => b.type === 'multiplier' && Date.now() - b.startTime < b.duration)
            .reduce((acc, b) => acc * b.value, 1);
          
          const prestigeMultiplier = prestige.multipliers?.coins || 1;
          const totalValue = autoClicker.value * bonusMultiplier * prestigeMultiplier;
          
          return {
            ...prev,
            coins: prev.coins + totalValue
          };
        });
      }, gameState.upgrades.autoClicker.interval);
      
      return () => clearInterval(interval);
    }
  }, [gameState.upgrades?.autoClicker?.level, gameState.upgrades?.autoClicker?.interval, gameState.upgrades?.autoClicker?.active]);

  // Sistema de Bônus Temporários
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        const now = Date.now();
        const currentBonuses = prev.activeBonuses || [];
        const activeBonuses = currentBonuses.filter(bonus => 
          now - bonus.startTime < bonus.duration
        );
        
        if (activeBonuses.length !== currentBonuses.length) {
          return { ...prev, activeBonuses };
        }
        return prev;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Sistema de Recompensas - Verificação de disponibilidade
  useEffect(() => {
    const now = Date.now();
    const today = new Date().toISOString().slice(0, 10);
    
    setGameState(prev => {
      // Garantir que rewards existe e tem a estrutura correta
      const rewards = prev.rewards || INITIAL_STATE.rewards;
      const safeRewards = {
        daily: rewards.daily || INITIAL_STATE.rewards.daily,
        weekly: rewards.weekly || INITIAL_STATE.rewards.weekly,
        monthly: rewards.monthly || INITIAL_STATE.rewards.monthly,
        login: rewards.login || INITIAL_STATE.rewards.login
      };
      
      let updated = false;
      const newRewards = { ...safeRewards };
      
      // Verificar recompensa diária
      if (safeRewards.daily.lastClaim !== today) {
        newRewards.daily = {
          ...safeRewards.daily,
          available: true
        };
        updated = true;
      }
      
      // Verificar recompensa semanal (a cada 7 dias)
      const lastWeeklyClaim = safeRewards.weekly.lastClaimTimestamp;
      if (!lastWeeklyClaim || (now - lastWeeklyClaim) >= 7 * 24 * 60 * 60 * 1000) {
        newRewards.weekly = {
          ...safeRewards.weekly,
          available: true
        };
        updated = true;
      }
      
      // Verificar recompensa mensal (a cada 30 dias)
      const lastMonthlyClaim = safeRewards.monthly.lastClaimTimestamp;
      if (!lastMonthlyClaim || (now - lastMonthlyClaim) >= 30 * 24 * 60 * 60 * 1000) {
        newRewards.monthly = {
          ...safeRewards.monthly,
          available: true
        };
        updated = true;
      }
      
      return updated ? { ...prev, rewards: newRewards } : prev;
    });
  }, []);

  // Reset diário/semanal das missões
  useEffect(() => {
    setGameState(prev => {
      let missions = { ...prev.missions };
      if (missions.lastDaily !== getTodayKey()) {
        missions.daily = getDailyMissions(() => '').map(m => ({ ...m, progress: 0, completed: false }));
        missions.lastDaily = getTodayKey();
      }
      if (missions.lastWeekly !== getWeekKey()) {
        missions.weekly = getWeeklyMissions(() => '').map(m => ({ ...m, progress: 0, completed: false }));
        missions.lastWeekly = getWeekKey();
      }
      return { ...prev, missions };
    });
  }, []);

  // Atualiza evento sazonal automaticamente
  useEffect(() => {
    setGameState(prev => ({ ...prev, seasonalEvent: getActiveEvent() }));
  }, []);

  // ===== SISTEMA DE ENERGIA =====

  const updateEnergy = useCallback(() => {
    setGameState(prev => {
      const now = Date.now();
      const timeDiff = (now - prev.energy.lastUpdate) / 1000 / 60; // minutos
      const energyToAdd = Math.floor(timeDiff * prev.energy.recoveryRate);
      const newEnergy = Math.min(prev.energy.max, prev.energy.current + energyToAdd);
      
      return {
        ...prev,
        energy: {
          ...prev.energy,
          current: newEnergy,
          lastUpdate: now,
          isRecovering: newEnergy < prev.energy.max
        }
      };
    });
  }, []);

  // Salva personalização no localStorage (com debounce para evitar múltiplas chamadas)
  useEffect(() => {
    if (gameState.customization) {
      const timeoutId = setTimeout(() => {
        console.log('Salvando configurações no localStorage:', gameState.customization);
        try {
      localStorage.setItem('nutriaCustomization', JSON.stringify(gameState.customization));
          console.log('Configurações salvas com sucesso!');
        } catch (error) {
          console.error('Erro ao salvar configurações:', error);
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [JSON.stringify(gameState.customization)]);

  const updateAchievements = (state) => {
    const unlocked = new Set(state.achievements || []);
    
    // Streak achievements
    if (state.streak >= 5) unlocked.add('streak5');
    if (state.streak >= 10) unlocked.add('streak10');
    if (state.streak >= 25) unlocked.add('streak25');
    
    // Wealth achievements
    if (state.coins >= 100) unlocked.add('coins100');
    if (state.coins >= 1000) unlocked.add('coins1000');
    if (state.coins >= 5000) unlocked.add('coins5000');
    
    // Progress achievements
    if (state.upgrades?.clickUpgrade?.level > 1) unlocked.add('upgrade1');
    if (state.upgrades?.clickUpgrade?.level >= 5) unlocked.add('upgrade5');
    if (state.level >= 5) unlocked.add('level5');
    if (state.level >= 10) unlocked.add('level10');
    if ((state.daysActive?.length || 0) >= 7) unlocked.add('day7');
    
    // Social achievements
    if ((state.referrals?.length || 0) >= 1) unlocked.add('referral1');
    
    // Event achievements
    if ((state.skinsUnlocked?.length || 0) >= 1) unlocked.add('skinUnlock');
    if ((state.airdropPoints || 0) >= 100) unlocked.add('airdrop100');
    
    // Event-specific achievements (check if events are active)
    if (isEventActive('natal2024')) unlocked.add('conquista_natal');
    if (isEventActive('carnaval2025')) unlocked.add('conquista_carnaval');
    
    return Array.from(unlocked);
  };

  // Adiciona moedas quando o jogador clica
  const addCoins = () => {
    setGameState(prev => {
      const now = Date.now();
      let streak = prev.streak;
      if (now - prev.lastClick < 900) {
        streak = prev.streak + 1;
      } else {
        streak = 1;
      }
      const maxStreak = Math.max(prev.maxStreak || 0, streak);
      let newExperience = prev.experience + 1;
      let newLevel = prev.level;
      let newExpToNextLevel = prev.experienceToNextLevel;
      let newNutriaImage = prev.nutriaImage;
      let newStats = { ...prev.stats };
      let leveledUp = false;

      if (newExperience >= prev.experienceToNextLevel && prev.level < MAX_LEVEL) {
        newLevel = prev.level + 1;
        newExpToNextLevel = getExpToNextLevel(newLevel);
        newNutriaImage = getNutriaImage(newLevel);
        newStats = {
          strength: prev.stats.strength + Math.floor(Math.random() * 2) + 1,
          agility: prev.stats.agility + Math.floor(Math.random() * 2) + 1,
          defense: prev.stats.defense + Math.floor(Math.random() * 2) + 1,
          charisma: prev.stats.charisma + Math.floor(Math.random() * 2) + 1
        };
        leveledUp = true;
      }

      if (leveledUp) setLevelUpEffect(true);

      // Atualizar conquistas
      const newAchievements = updateAchievements({
        ...prev,
        streak,
        coins: prev.coins + prev.clickValue,
        upgrades: prev.upgrades,
        level: newLevel,
      });
      // Atualizar dias ativos
      const today = getToday();
      const daysActive = prev.daysActive?.includes(today)
        ? prev.daysActive
        : [...(prev.daysActive || []), today];
      // Atualizar pontos de airdrop
      const newAirdropPoints = calcAirdropPoints({
        ...prev,
        streak,
        maxStreak,
        coins: prev.coins + prev.clickValue,
        upgrades: prev.upgrades,
        level: newLevel,
        achievements: newAchievements,
        totalClicks: (prev.totalClicks || 0) + 1,
        daysActive,
        referralStats: prev.referralStats || [],
      });
      // Atualizar progresso de missão diária de cliques
      let missions = { ...prev.missions };
      missions.daily = missions.daily.map(m =>
        m.id === 'click50' ? { ...m, progress: Math.min(m.progress + 1, m.goal), completed: m.progress + 1 >= m.goal } : m
      );
      // Atualizar missão semanal de streaks (contar streaks que terminam em 0 ou 5)
      if (streak % 5 === 0 && streak >= 5) {
        missions.weekly = missions.weekly.map(m =>
          m.id === 'streak100' ? { ...m, progress: Math.min(m.progress + 1, m.goal), completed: m.progress + 1 >= m.goal } : m
        );
      }
      // Aplicar multiplicadores de prestígio
      const prestigeMultiplier = prev.prestige?.multipliers?.coins || 1;
      const coinsGained = Math.floor(prev.clickValue * prestigeMultiplier);
      const expMultiplier = prev.prestige?.multipliers?.experience || 1;
      const experienceGained = Math.floor(1 * expMultiplier);
      
      const newState = {
        ...prev,
        coins: prev.coins + coinsGained,
        experience: newExperience >= prev.experienceToNextLevel ? 0 : newExperience,
        level: newLevel,
        experienceToNextLevel: newExpToNextLevel,
        nutriaImage: newNutriaImage,
        stats: newStats,
        streak,
        maxStreak,
        lastClick: now,
        achievements: newAchievements,
        airdropPoints: newAirdropPoints,
        totalClicks: (prev.totalClicks || 0) + 1,
        daysActive,
        missions,
      };
      
      // Sincronizar com Supabase a cada 5 cliques para evitar spam
      if (newState.totalClicks % 5 === 0) {
        syncToSupabase(newState);
      }
      
      return newState;
    });
  };

  // Efeito visual ao subir de nível
  useEffect(() => {
    if (levelUpEffect) {
      // Mostrar notificação de level up
      notificationService.showLevelUpNotification(gameState.level);
      
      setTimeout(() => setLevelUpEffect(false), 800);
    }
  }, [levelUpEffect, gameState.level]);

  // Compra upgrade que aumenta o valor de cada clique
  const buyClickUpgrade = () => {
    setGameState(prev => {
      const upgrades = prev.upgrades || INITIAL_STATE.upgrades;
      const upgrade = upgrades.clickUpgrade || INITIAL_STATE.upgrades.clickUpgrade;
      
      // Aplicar multiplicador de prestígio no custo (desconto)
      const upgradeMultiplier = prev.prestige?.multipliers?.upgrades || 1;
      const adjustedCost = Math.floor((upgrade.cost || 10) / Math.sqrt(upgradeMultiplier));
      
      // Verifica se o jogador tem moedas suficientes
      if (prev.coins < adjustedCost) {
        return prev;
      }
      
      const newLevel = (upgrade.level || 1) + 1;
      // Progressão mais difícil: custo cresce mais rápido
      const newCost = Math.floor(adjustedCost * (1.9 + newLevel * 0.08));
      const newValue = (upgrade.value || 1) + Math.floor(1 * upgradeMultiplier);
      
      const newState = {
        ...prev,
        coins: prev.coins - adjustedCost,
        clickValue: prev.clickValue + Math.floor(1 * upgradeMultiplier),
        upgrades: {
          ...upgrades,
          clickUpgrade: {
            level: newLevel,
            cost: newCost,
            value: newValue
          }
        }
      };
      
      // Sincronizar após compra de upgrade
      syncToSupabase(newState);
      
      return newState;
    });
  };

  // Compra Auto-Clicker
  const buyAutoClicker = () => {
    setGameState(prev => {
      const upgrades = prev.upgrades || INITIAL_STATE.upgrades;
      const upgrade = upgrades.autoClicker || INITIAL_STATE.upgrades.autoClicker;
      
      // Aplicar multiplicador de prestígio no custo (desconto)
      const upgradeMultiplier = prev.prestige?.multipliers?.upgrades || 1;
      const adjustedCost = Math.floor((upgrade.cost || 100) / Math.sqrt(upgradeMultiplier));
      
      if (prev.coins < adjustedCost) {
        return prev;
      }
      
      const newLevel = (upgrade.level || 0) + 1;
      const newCost = Math.floor(adjustedCost * (1.8 + newLevel * 0.1));
      const newValue = (upgrade.value || 0.1) + (0.1 * upgradeMultiplier);
      const newInterval = Math.max(100, (upgrade.interval || 1000) - 50);
      
      return {
        ...prev,
        coins: prev.coins - adjustedCost,
        upgrades: {
          ...upgrades,
          autoClicker: {
            level: newLevel,
            cost: newCost,
            value: newValue,
            interval: newInterval,
            active: true
          }
        }
      };
    });
  };

  // Toggle Auto-Clicker
  const toggleAutoClicker = () => {
    setGameState(prev => {
      const upgrades = prev.upgrades || INITIAL_STATE.upgrades;
      const autoClicker = upgrades.autoClicker || INITIAL_STATE.upgrades.autoClicker;
      
      if (autoClicker.level === 0) {
        return prev;
      }
      
      return {
        ...prev,
        upgrades: {
          ...upgrades,
          autoClicker: {
            ...autoClicker,
            active: !autoClicker.active
          }
        }
      };
    });
  };

  // Compra Multiplicador
  const buyMultiplier = () => {
    setGameState(prev => {
      const upgrades = prev.upgrades || INITIAL_STATE.upgrades;
      const upgrade = upgrades.multiplier || INITIAL_STATE.upgrades.multiplier;
      if (prev.coins < (upgrade.cost || 500)) {
        return prev;
      }
      const newLevel = (upgrade.level || 0) + 1;
      const newCost = Math.floor((upgrade.cost || 500) * (2.0 + newLevel * 0.15));
      const newValue = (upgrade.value || 1.5) + 0.5;
      
      // Adiciona bônus temporário
      const newBonus = {
        id: Date.now(),
        type: 'multiplier',
        value: newValue,
        duration: upgrade.duration || 30000,
        startTime: Date.now()
      };
      
      return {
        ...prev,
        coins: prev.coins - (upgrade.cost || 500),
        activeBonuses: [...(prev.activeBonuses || []), newBonus],
        upgrades: {
          ...upgrades,
          multiplier: {
            level: newLevel,
            cost: newCost,
            value: newValue,
            duration: upgrade.duration || 30000
          }
        }
      };
    });
  };

  // Sistema de Prestígio
  const performPrestige = () => {
    setGameState(prev => {
      const upgrades = prev.upgrades || INITIAL_STATE.upgrades;
      const prestige = prev.prestige || INITIAL_STATE.prestige;
      
      // Verificar se tem moedas suficientes para prestígio
      if (prev.coins < 10000) {
        console.log('Moedas insuficientes para prestígio:', prev.coins);
        setPrestigeMessage('Você precisa de pelo menos 10.000 moedas para fazer prestígio!');
        setTimeout(() => setPrestigeMessage(null), 3000);
        return prev;
      }
      
      const prestigePoints = Math.floor(prev.coins / 1000);
      const newPrestigeLevel = prestige.level + 1;
      const newMultiplier = (prestige.multipliers?.coins || 1) * 1.1;
      
      const newState = {
        ...INITIAL_STATE,
        referralId: prev.referralId,
        referrals: prev.referrals || [],
        achievements: prev.achievements || [],
        maxStreak: prev.maxStreak || 0,
        daysActive: prev.daysActive || [],
        totalClicks: prev.totalClicks || 0,
        rewards: prev.rewards || INITIAL_STATE.rewards,
        activeBonuses: prev.activeBonuses || INITIAL_STATE.activeBonuses,
        challenges: prev.challenges || INITIAL_STATE.challenges,
        dynamicEvents: prev.dynamicEvents || INITIAL_STATE.dynamicEvents,
        seasonalEvent: prev.seasonalEvent || INITIAL_STATE.seasonalEvent,
        titles: prev.titles || INITIAL_STATE.titles,
        equippedTitle: prev.equippedTitle || INITIAL_STATE.equippedTitle,
        customization: prev.customization || INITIAL_STATE.customization,
        prestige: {
          level: newPrestigeLevel,
          points: prestige.points + prestigePoints,
          totalPrestige: prestige.totalPrestige + prestigePoints,
          multipliers: {
            coins: newMultiplier,
            experience: newMultiplier,
            upgrades: newMultiplier
          }
        },
        upgrades: {
          ...INITIAL_STATE.upgrades,
          prestige: {
            level: newPrestigeLevel,
            cost: Math.floor((upgrades.prestige?.cost || 10000) * 1.5),
            multiplier: newMultiplier
          }
        },
        // Aplicar multiplicadores nos valores base
        clickValue: Math.floor(INITIAL_STATE.clickValue * newMultiplier)
      };
      
      // Sincronizar após prestígio
      setTimeout(() => syncToSupabase(newState), 100);
      
      return newState;
    });
    setPrestigeMessage('Prestígio realizado! Multiplicadores aplicados!');
    setTimeout(() => setPrestigeMessage(null), 3000);
  };

  // Sistema de Recompensas
  const claimDailyReward = () => {
    setGameState(prev => {
      const today = new Date().toISOString().slice(0, 10);
      const now = Date.now();
      const rewards = prev.rewards || INITIAL_STATE.rewards;
      
      if (rewards.daily.lastClaim === today || !rewards.daily.available) {
        return prev;
      }
      
      const streak = rewards.daily.streak + 1;
      const reward = Math.floor(100 * Math.pow(1.5, streak - 1));
      
      return {
        ...prev,
        coins: prev.coins + reward,
        rewards: {
          ...rewards,
          daily: {
            streak,
            lastClaim: today,
            available: false,
            lastClaimTimestamp: now
          }
        }
      };
    });
  };

  const claimWeeklyReward = () => {
    setGameState(prev => {
      const now = Date.now();
      const rewards = prev.rewards || INITIAL_STATE.rewards;
      
      if (!rewards.weekly.available) {
        return prev;
      }
      
      const week = Math.floor((now - (prev.startDate ? new Date(prev.startDate).getTime() : now)) / (7 * 24 * 60 * 60 * 1000));
      const reward = Math.floor(500 * Math.pow(1.2, week));
      
      return {
        ...prev,
        coins: prev.coins + reward,
        rewards: {
          ...rewards,
          weekly: {
            lastClaim: new Date().toISOString().slice(0, 10),
            available: false,
            lastClaimTimestamp: now
          }
        }
      };
    });
  };

  const claimMonthlyReward = () => {
    setGameState(prev => {
      const now = Date.now();
      const rewards = prev.rewards || INITIAL_STATE.rewards;
      
      if (!rewards.monthly.available) {
        return prev;
      }
      
      const month = Math.floor((now - (prev.startDate ? new Date(prev.startDate).getTime() : now)) / (30 * 24 * 60 * 60 * 1000));
      const reward = Math.floor(2000 * Math.pow(1.1, month));
      
      return {
        ...prev,
        coins: prev.coins + reward,
        rewards: {
          ...rewards,
          monthly: {
            lastClaim: new Date().toISOString().slice(0, 10),
            available: false,
            lastClaimTimestamp: now
          }
        }
      };
    });
  };

  const claimLoginReward = (day) => {
    setGameState(prev => {
      const now = Date.now();
      const rewards = prev.rewards || INITIAL_STATE.rewards;
      
      if (rewards.login.claimed.includes(day)) {
        return prev;
      }
      
      const rewardAmounts = { 7: 1000, 14: 2500, 21: 5000, 28: 10000 };
      const reward = rewardAmounts[day] || 0;
      
      return {
        ...prev,
        coins: prev.coins + reward,
        rewards: {
          ...rewards,
          login: {
            claimed: [...rewards.login.claimed, day],
            lastClaim: new Date().toISOString().slice(0, 10),
            lastClaimTimestamp: now
          }
        }
      };
    });
  };

  // Função para atualizar progresso de missão ao conquistar badge
  const onBadgeUnlocked = () => {
    setGameState(prev => {
      let missions = { ...prev.missions };
      missions.daily = missions.daily.map(m =>
        m.id === 'badge1' ? { ...m, progress: Math.min(m.progress + 1, m.goal), completed: m.progress + 1 >= m.goal } : m
      );
      return { ...prev, missions };
    });
  };

  // Adiciona um referido ao jogador
  // LÓGICA CORRETA: Quando você usa um código de referência, você se torna referido de quem possui esse código
  const addReferral = async (referralCode) => {
    // Verificar se o código tem 8 caracteres
    if (!referralCode || referralCode.length !== 8) {
      addNotification('Código de referência deve ter exatamente 8 caracteres!', 'error');
      return false;
    }
    
    // Verificar se não está tentando se referenciar
    if (referralCode === gameState.referralId) {
      addNotification('Você não pode usar seu próprio código de referência!', 'error');
      return false;
    }
    
    // Verificar se já usou este código
    if (gameState.referrals.includes(referralCode)) {
      addNotification('Você já usou este código de referência!', 'warning');
      return false;
    }
    
    try {
      // 1. Buscar o usuário que possui este código de referência
      const { data: referrerUser, error: referrerError } = await supabase
        .from('users')
        .select('id, username, referral_id')
        .eq('referral_id', referralCode)
        .single();
      
      if (referrerError || !referrerUser) {
        console.error('Código de referência não encontrado:', referrerError);
        addNotification('Código de referência inválido ou não encontrado!', 'error');
        return false;
      }
      
      // 2. Verificar se o usuário atual está logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Usuário não está logado');
        addNotification('Você precisa estar logado para usar códigos de referência!', 'error');
        return false;
      }
      
      // 3. Verificar se já foi referenciado por alguém
      const { data: currentUser } = await supabase
        .from('users')
        .select('referred_by')
        .eq('id', user.id)
        .single();
      
      if (currentUser?.referred_by) {
        addNotification('Você já foi referenciado por outro usuário!', 'warning');
        return false;
      }
      
      // 4. Buscar referrals atuais do referenciador
      const { data: currentStats, error: statsError } = await supabase
        .from('game_stats')
        .select('referrals')
        .eq('user_id', referrerUser.id)
        .single();
      
      if (statsError) {
        console.error('Erro ao buscar stats do referenciador:', statsError);
        addNotification('Erro ao processar referência. Tente novamente!', 'error');
        return false;
      }
      
      // 5. Verificar se já foi referenciado por este usuário
      const currentReferrals = currentStats?.referrals || [];
      if (currentReferrals.includes(user.id)) {
        addNotification('Você já foi referenciado por este usuário!', 'warning');
        return false;
      }
      
      // 6. Adicionar o usuário atual como referido do dono do código
      const newReferrals = [...currentReferrals, user.id];
      const { error: addReferralError } = await supabase
        .from('game_stats')
        .update({
          referrals: newReferrals
        })
        .eq('user_id', referrerUser.id);
      
      if (addReferralError) {
        console.error('Erro ao adicionar referido:', addReferralError);
        addNotification('Erro ao processar referência. Tente novamente!', 'error');
        return false;
      }
      
      // 7. Marcar que o usuário atual foi referenciado por este código
      const { error: markReferredError } = await supabase
        .from('users')
        .update({
          referred_by: referralCode
        })
        .eq('id', user.id);
      
      if (markReferredError) {
        console.error('Erro ao marcar como referido:', markReferredError);
        // Não retorna false aqui, pois o referido já foi adicionado
      }
      
      // 8. Atualizar estado local
      setGameState(prev => {
        // Adicionar o código usado à lista de códigos utilizados
        const newReferrals = [...prev.referrals, referralCode];
        
        // Atualizar missões baseado no número de códigos usados
        let missions = { ...prev.missions };
        missions.weekly = missions.weekly.map(m =>
          m.id === 'refer1' ? { ...m, progress: Math.min(newReferrals.length, m.goal), completed: newReferrals.length >= m.goal } : m
        );
        
        // Verificar se desbloqueou conquista de referido
        const newAchievements = [...prev.achievements];
        if (newReferrals.length >= 1 && !newAchievements.includes('referral1')) {
          newAchievements.push('referral1');
        }
        
        return {
          ...prev,
          referrals: newReferrals, // Lista de códigos que este usuário usou
          missions,
          achievements: newAchievements,
        };
      });
      
      // 9. Mostrar notificação de sucesso
      addNotification(`Código de referência adicionado com sucesso! Você foi referenciado por ${referrerUser.username}`, 'success', 5000);
      
      console.log(`Usuário ${user.id} foi adicionado como referido de ${referrerUser.username} (${referralCode})`);
      return true; // Sucesso
      
    } catch (error) {
      console.error('Erro na função addReferral:', error);
      addNotification('Erro ao processar referência. Tente novamente!', 'error');
      return false; // Erro: falha geral
    }
  };

  // Reseta o jogo para o estado inicial, mas mantém o ID de referência
  const resetGame = () => {
    const referralId = gameState.referralId;
    setGameState({
      ...INITIAL_STATE,
      referralId
    });
  };

  // Função para atualizar progresso de missão
  const updateMissionProgress = (type, id, amount = 1) => {
    setGameState(prev => {
      const missions = { ...prev.missions };
      const list = missions[type].map(m =>
        m.id === id ? { ...m, progress: Math.min(m.progress + amount, m.goal), completed: m.progress + amount >= m.goal } : m
      );
      missions[type] = list;
      return { ...prev, missions };
    });
  };

  // Função para marcar missão como 'claim' ao resgatar recompensa
  const claimMissionReward = (type, id) => {
    setGameState(prev => {
      const missions = { ...prev.missions };
      missions[type] = missions[type].map(m =>
        m.id === id ? { ...m, claimed: true } : m
      );
      return { ...prev, missions };
    });
  };

  // Função para atualizar títulos desbloqueados
  const updateTitles = (state, getRank, isEventActive) => {
    return getTitles(() => '').map(t => ({
      ...t,
      unlocked: typeof t.unlock === 'function' ? t.unlock(state, getRank, isEventActive) : false
    }));
  };

  // Títulos são atualizados quando necessário através das funções específicas

  // Função para equipar título
  const equipTitle = (id) => {
    setGameState(prev => ({ ...prev, equippedTitle: id }));
  };

  // Função para sincronização manual
  const manualSync = async () => {
    await syncToSupabase(gameState);
  };

  // Sincronização forçada quando a página carrega (após 5 segundos)
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Sincronização automática iniciada...');
      syncToSupabase(gameState);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Função para atualizar personalização
  const updateCustomization = (custom) => {
    console.log('updateCustomization chamado com:', custom);
    setGameState(prev => {
      const newState = { ...prev, customization: { ...prev.customization, ...custom } };
      console.log('Novo estado de customization:', newState.customization);
      return newState;
    });
  };

  // Função para restaurar padrão
  const resetCustomization = () => {
    setGameState(prev => ({ ...prev, customization: { ...getDefaultCustomization() } }));
  };

  // ===== SISTEMA DE ENERGIA =====

  const canClick = () => {
    const current = gameState.energy.current;
    const cost = gameState.energy.clickCost;
    return current >= cost;
  };

  const spendEnergy = (amount = gameState.energy.clickCost) => {
    setGameState(prev => ({
      ...prev,
      energy: {
        ...prev.energy,
        current: Math.max(0, prev.energy.current - amount)
      }
    }));
  };

  // ===== SISTEMA ANTI-CHEAT =====

  const validateClick = () => {
    const now = Date.now();
    const timeDiff = now - gameState.antiCheat.lastClickTime;
    
    // Reset contador se passou mais de 1 segundo
    if (timeDiff >= 1000) {
      setGameState(prev => ({
        ...prev,
        antiCheat: {
          ...prev.antiCheat,
          clickCount: 0,
          lastClickTime: now
        }
      }));
      return true;
    }
    
    // Verificar se excedeu limite de cliques por segundo
    if (gameState.antiCheat.clickCount >= gameState.antiCheat.maxClicksPerSecond) {
      setGameState(prev => ({
        ...prev,
        antiCheat: {
          ...prev.antiCheat,
          suspiciousActivity: true
        }
      }));
      return false;
    }
    
    // Incrementar contador
    setGameState(prev => ({
      ...prev,
      antiCheat: {
        ...prev.antiCheat,
        clickCount: prev.antiCheat.clickCount + 1,
        lastClickTime: now
      }
    }));
    
    return true;
  };

  // Função de clique com validação de energia e anti-cheat
  const clickNutria = () => {
    // Verificar se tem energia suficiente
    if (!canClick()) {
      console.log('Energia insuficiente para clicar');
      return false;
    }
    
    // Validar contra auto-click
    if (!validateClick()) {
      console.log('Clique bloqueado por suspeita de auto-click');
      return false;
    }
    
    // Gastar energia
    spendEnergy();
    
    // Executar o clique normal
    addCoins();
    
    return true;
  };

  return (
    <GameContext.Provider 
      value={{ 
        gameState,
        addCoins,
        buyClickUpgrade,
        buyAutoClicker,
        buyMultiplier,
        performPrestige,
        toggleAutoClicker,
        claimDailyReward,
        claimWeeklyReward,
        claimMonthlyReward,
        claimLoginReward,
        prestigeMessage,
        addReferral,
        resetGame,
        levelUpEffect,
        theme,
        setTheme,
        missions: gameState.missions,
        updateMissionProgress,
        claimMissionReward,
        onBadgeUnlocked,
        seasonalEvent: gameState.seasonalEvent,
        isEventActive,
        titles: gameState.titles,
        equippedTitle: gameState.equippedTitle,
        equipTitle,
        customization: gameState.customization,
        updateCustomization,
        resetCustomization,
        getCircleColors,
        getBorderStyles,
        getBgStyles,
        getEffects,
        getAchievements,
        manualSync,
        // Sistema de Energia
        clickNutria,
        canClick,
        spendEnergy,
        // Sistema Anti-Cheat
        validateClick,
        // Sistema de Notificações
        notifications,
        addNotification,
        removeNotification,
        clearNotifications
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);