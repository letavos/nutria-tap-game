// Serviço de API integrado com Supabase para Nutria Tap PWA
import { supabase, isSupabaseConfigured } from '../config/supabase.js'

class SupabaseApiService {
  constructor() {
    this.onlineStatus = navigator.onLine;
    this.retryCount = 3;
    this.retryDelay = 1000;
    this.supabaseConfigured = isSupabaseConfigured();
    this.setupOnlineListener();
  }

  // Configurar listener para mudanças de conectividade
  setupOnlineListener() {
    window.addEventListener('online', () => {
      this.onlineStatus = true;
      console.log('Conexão restaurada - sincronizando dados...');
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.onlineStatus = false;
      console.log('Conexão perdida - modo offline ativado');
    });
  }

  // Verificar se está online
  isOnline() {
    return this.onlineStatus && this.supabaseConfigured;
  }

  // Função genérica para retry
  async withRetry(operation, maxRetries = this.retryCount) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
      }
    }
  }

  // ===== USUÁRIOS =====

  // Registrar usuário
  async registerUser(userData) {
    if (!this.isOnline()) {
      throw new Error('Modo offline - não é possível registrar usuário');
    }

    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          username: userData.username,
          email: userData.email,
          wallet_address: userData.walletAddress
        }])
        .select()
        .single();

      if (error) throw error;

      // Criar estatísticas iniciais
      await this.createInitialStats(data.id);

      return data;
    });
  }

  // Login de usuário
  async loginUser(identifier) {
    if (!this.isOnline()) {
      throw new Error('Modo offline - não é possível fazer login');
    }

    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.eq.${identifier},email.eq.${identifier}`)
        .single();

      if (error) throw error;
      return data;
    });
  }

  // Atualizar perfil do usuário
  async updateUserProfile(userId, updates) {
    if (!this.isOnline()) {
      throw new Error('Modo offline - não é possível atualizar perfil');
    }

    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    });
  }

  // ===== ESTATÍSTICAS DO JOGO =====

  // Criar estatísticas iniciais
  async createInitialStats(userId) {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('game_stats')
        .insert([{
          user_id: userId,
          total_coins: 0,
          total_clicks: 0,
          level: 1,
          experience: 0,
          prestige_level: 0,
          streak: 0
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  }

  // Atualizar estatísticas do usuário
  async updateUserStats(userId, stats) {
    if (!this.isOnline()) {
      throw new Error('Modo offline - não é possível atualizar estatísticas');
    }

    return this.withRetry(async () => {
      // Primeiro verificar se o usuário existe
      const { data: userExists, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (userError || !userExists) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar se as estatísticas existem
      const { data: existingStats, error: statsError } = await supabase
        .from('game_stats')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (statsError && statsError.code === 'PGRST116') {
        // Criar estatísticas se não existirem
        return await this.createInitialStats(userId);
      }

      // Atualizar estatísticas existentes
      const { data, error } = await supabase
        .from('game_stats')
        .update({
          total_coins: stats.totalCoins,
          total_clicks: stats.totalClicks,
          level: stats.level,
          experience: stats.experience,
          prestige_level: stats.prestigeLevel,
          streak: stats.streak,
          last_click: new Date().toISOString(),
          last_sync: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    });
  }

  // Obter estatísticas do usuário
  async getUserStats(userId) {
    if (!this.isOnline()) {
      throw new Error('Modo offline - não é possível obter estatísticas');
    }

    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('game_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Estatísticas não encontradas, criar iniciais
          return await this.createInitialStats(userId);
        }
        throw error;
      }
      return data;
    });
  }

  // ===== RANKING =====

  // Obter ranking
  async getRanking(limit = 100) {
    if (!this.isOnline()) {
      throw new Error('Modo offline - não é possível obter ranking');
    }

    return this.withRetry(async () => {
      // Usar a tabela game_stats diretamente com join para users
      const { data, error } = await supabase
        .from('game_stats')
        .select(`
          user_id,
          total_coins,
          total_clicks,
          level,
          prestige_level,
          streak,
          users!inner(
            id,
            username,
            email,
            created_at
          )
        `)
        .order('total_coins', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Transformar os dados para o formato esperado
      return data.map(item => ({
        id: item.user_id,
        username: item.users.username,
        email: item.users.email,
        created_at: item.users.created_at,
        total_coins: item.total_coins,
        total_clicks: item.total_clicks,
        level: item.level,
        prestige_level: item.prestige_level,
        streak: item.streak
      }));
    });
  }

  // Obter posição do usuário no ranking
  async getUserRank(userId) {
    if (!this.isOnline()) {
      throw new Error('Modo offline - não é possível obter posição no ranking');
    }

    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('game_stats')
        .select(`
          user_id,
          total_coins,
          total_clicks,
          level,
          prestige_level,
          streak,
          users!inner(
            id,
            username,
            email,
            created_at
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      
      // Transformar os dados para o formato esperado
      return {
        id: data.user_id,
        username: data.users.username,
        email: data.users.email,
        created_at: data.users.created_at,
        total_coins: data.total_coins,
        total_clicks: data.total_clicks,
        level: data.level,
        prestige_level: data.prestige_level,
        streak: data.streak
      };
    });
  }

  // ===== UPGRADES =====

  // Salvar upgrades do usuário
  async saveUserUpgrades(userId, upgrades) {
    if (!this.isOnline()) {
      throw new Error('Modo offline - não é possível salvar upgrades');
    }

    return this.withRetry(async () => {
      // Deletar upgrades existentes
      await supabase
        .from('user_upgrades')
        .delete()
        .eq('user_id', userId);

      // Inserir novos upgrades
      const upgradesData = Object.entries(upgrades).map(([type, upgrade]) => ({
        user_id: userId,
        upgrade_type: type,
        level: upgrade.level,
        cost: upgrade.cost,
        value: upgrade.value
      }));

      const { data, error } = await supabase
        .from('user_upgrades')
        .insert(upgradesData)
        .select();

      if (error) throw error;
      return data;
    });
  }

  // Obter upgrades do usuário
  async getUserUpgrades(userId) {
    if (!this.isOnline()) {
      throw new Error('Modo offline - não é possível obter upgrades');
    }

    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('user_upgrades')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    });
  }

  // ===== CONQUISTAS =====

  // Desbloquear conquista
  async unlockAchievement(userId, achievementId) {
    if (!this.isOnline()) {
      throw new Error('Modo offline - não é possível desbloquear conquista');
    }

    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert([{
          user_id: userId,
          achievement_id: achievementId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  }

  // Obter conquistas do usuário
  async getUserAchievements(userId) {
    if (!this.isOnline()) {
      throw new Error('Modo offline - não é possível obter conquistas');
    }

    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    });
  }

  // ===== RECOMPENSAS DIÁRIAS =====

  // Reivindicar recompensa diária
  async claimDailyReward(userId, rewardData) {
    if (!this.isOnline()) {
      throw new Error('Modo offline - não é possível reivindicar recompensa');
    }

    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('daily_rewards')
        .insert([{
          user_id: userId,
          reward_date: new Date().toISOString().split('T')[0],
          reward_type: rewardData.type,
          reward_value: rewardData.value
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  }

  // Verificar se recompensa já foi reivindicada
  async checkDailyRewardClaimed(userId, date) {
    if (!this.isOnline()) {
      throw new Error('Modo offline - não é possível verificar recompensa');
    }

    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('daily_rewards')
        .select('*')
        .eq('user_id', userId)
        .eq('reward_date', date)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    });
  }

  // ===== SINCRONIZAÇÃO =====

  // Sincronizar dados offline
  async syncOfflineData() {
    if (!this.isOnline()) {
      console.log('Modo offline - sincronização adiada');
      return;
    }

    try {
      // Aqui você pode implementar lógica para sincronizar dados offline
      console.log('Sincronizando dados offline...');
      return { success: true };
    } catch (error) {
      console.error('Erro na sincronização:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== UTILITÁRIOS =====

  // Verificar disponibilidade de username
  async checkUsernameAvailability(username) {
    if (!this.isOnline()) {
      throw new Error('Modo offline - não é possível verificar username');
    }

    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !data; // true se disponível, false se já existe
    });
  }

  // Obter referral ID do usuário
  async getUserReferralId(userId) {
    if (!this.isOnline()) {
      throw new Error('Modo offline - não é possível obter referral ID');
    }

    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from('users')
        .select('referral_id')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Usuário não encontrado
        }
        throw error;
      }
      return data?.referral_id || null;
    });
  }

  // Testar conexão
  async testConnection() {
    if (!this.supabaseConfigured) {
      return { success: false, error: 'Supabase não configurado' };
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

const supabaseApiService = new SupabaseApiService();
export default supabaseApiService;
