// Context de Autenticação com Supabase
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/AuthService';
import manualAuthService from '../services/ManualAuthService';
import supabaseApiService from '../services/SupabaseApiService';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inicializar autenticação com persistência de sessão
  useEffect(() => {
    let unsub = () => {};
    const initializeAuth = async () => {
      try {
        setLoading(true);

        // 1) Ler sessão atual diretamente do supabase (persistSession)
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          setUser(sessionData.session.user);
          setIsLoggedIn(true);
          const profileResult = await authService.getUserProfile();
          if (profileResult.success) setProfile(profileResult.profile);
        }

        // 2) Assinar mudanças de auth para manter login após F5/refresh
        const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            setUser(session.user);
            setIsLoggedIn(true);
            const profileResult = await authService.getUserProfile();
            if (profileResult.success) setProfile(profileResult.profile);
          } else {
            setUser(null);
            setProfile(null);
            setIsLoggedIn(false);
          }
        });
        unsub = () => sub.subscription.unsubscribe();
      } catch (error) {
        console.error('Erro ao inicializar auth:', error);
        setError('Erro ao carregar dados do usuário');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
    return () => unsub();
  }, []);

  // ===== REGISTRO =====

  const signUp = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // Validar dados
      if (!userData.email || !userData.password || !userData.username) {
        throw new Error('Todos os campos são obrigatórios');
      }

      if (userData.password.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
      }

      // Verificar disponibilidade do username
      const usernameCheck = await authService.checkUsernameAvailability(userData.username);
      if (!usernameCheck.success || !usernameCheck.available) {
        throw new Error('Nome de usuário já está em uso');
      }

      // Registrar usuário
      // Tentar registro normal primeiro
      let result;
      try {
        result = await authService.signUp({
          email: userData.email,
          password: userData.password,
          username: userData.username,
          displayName: userData.displayName || userData.username,
          walletAddress: userData.walletAddress,
          avatarUrl: userData.avatarUrl
        });
      } catch (error) {
        console.warn('Registro normal falhou, tentando manual:', error);
        // Fallback para registro manual
        result = await manualAuthService.signUpManual({
          email: userData.email,
          password: userData.password,
          username: userData.username,
          displayName: userData.displayName || userData.username,
          walletAddress: userData.walletAddress,
          avatarUrl: userData.avatarUrl
        });
      }

      if (result.success) {
        return {
          success: true,
          message: result.message,
          needsEmailConfirmation: result.needsEmailConfirmation
        };
      } else {
        console.error('Erro no registro:', result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      
      // Tratar erros específicos do Supabase
      let errorMessage = 'Erro ao criar conta';
      
      if (error.message.includes('Database error')) {
        errorMessage = 'Erro no servidor. Tente novamente em alguns minutos.';
      } else if (error.message.includes('already registered')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login.';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'Email inválido. Verifique o formato.';
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'Senha deve ter pelo menos 6 caracteres.';
      } else if (error.message.includes('username')) {
        errorMessage = 'Nome de usuário já está em uso.';
      } else {
        errorMessage = error.message || 'Erro ao criar conta. Tente novamente.';
      }
      
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== LOGIN =====

  const signIn = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.signIn(email, password);

      if (result.success) {
        // Carregar perfil do usuário
        const profileResult = await authService.getUserProfile();
        if (profileResult.success) {
          setUser(result.user);
          setProfile(profileResult.profile);
          setIsLoggedIn(true);
          
          // Carregar dados do jogo do Supabase (FONTE DA VERDADE)
          await loadGameDataFromSupabase(result.user.id);
        }
        
        return {
          success: true,
          message: result.message
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error.message || 'Erro ao fazer login';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== CARREGAR DADOS DO JOGO DO SUPABASE =====

  const loadGameDataFromSupabase = useCallback(async (userId) => {
    try {
      console.log('🔍 Carregando dados do jogo do Supabase para usuário:', userId);
      
      // 1. Verificar se usuário tem game_stats
      const { data: gameStats, error: statsError } = await supabase
        .from('game_stats')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Erro ao carregar game_stats:', statsError);
        return null;
      }
      
      if (!gameStats) {
        console.log('📝 Usuário não possui game_stats, criando...');
        // Criar game_stats inicial
        const initialStats = {
          user_id: userId,
          total_coins: 0,
          total_clicks: 0,
          level: 1,
          experience: 0,
          prestige_level: 0,
          streak: 0,
          max_streak: 0,
          total_achievements: 0,
          last_click: new Date().toISOString(),
          last_sync: new Date().toISOString(),
          referrals: [],
          achievements: [],
          airdrop_points: 0,
          days_active: [],
          missions: {
            daily: [],
            weekly: [],
            last_daily: new Date().toISOString().slice(0, 10),
            last_weekly: new Date().toISOString().slice(0, 10)
          },
          rewards: {
            daily: { streak: 0, last_claim: null, available: true, last_claim_timestamp: null },
            weekly: { last_claim: null, available: true, last_claim_timestamp: null },
            monthly: { last_claim: null, available: true, last_claim_timestamp: null },
            login: { claimed: [], last_claim: null, last_claim_timestamp: null }
          },
          customization: {
            circleColor: 'green',
            borderStyle: 'pulse',
            backgroundStyle: 'default',
            effects: 'none'
          }
        };
        
        const { error: createError } = await supabase
          .from('game_stats')
          .insert(initialStats);
        
        if (createError) {
          console.error('Erro ao criar game_stats:', createError);
          return null;
        }
        
        console.log('✅ Game_stats criado com sucesso');
        return initialStats;
      }
      
      console.log('✅ Dados do jogo carregados do Supabase:', gameStats);
      return gameStats;
      
    } catch (error) {
      console.error('Erro ao carregar dados do jogo:', error);
      return null;
    }
  }, []);

  // ===== LOGOUT =====

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.signOut();

      if (result.success) {
        setUser(null);
        setProfile(null);
        setIsLoggedIn(false);
        
        return {
          success: true,
          message: result.message
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error.message || 'Erro ao fazer logout';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== ATUALIZAR PERFIL =====

  const updateProfile = useCallback(async (updates) => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.updateProfile(updates);

      if (result.success) {
        // Recarregar perfil
        const profileResult = await authService.getUserProfile();
        if (profileResult.success) {
          setProfile(profileResult.profile);
        }
        
        return {
          success: true,
          message: result.message
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error.message || 'Erro ao atualizar perfil';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== RECUPERAÇÃO DE SENHA =====

  const resetPassword = useCallback(async (email) => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.resetPassword(email);

      if (result.success) {
        return {
          success: true,
          message: result.message
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error.message || 'Erro ao enviar email de recuperação';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== ATUALIZAR SENHA =====

  const updatePassword = useCallback(async (newPassword) => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.updatePassword(newPassword);

      if (result.success) {
        return {
          success: true,
          message: result.message
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error.message || 'Erro ao atualizar senha';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== VERIFICAR USERNAME =====

  const checkUsernameAvailability = useCallback(async (username) => {
    try {
      const result = await authService.checkUsernameAvailability(username);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }, []);

  // ===== ATUALIZAR ESTATÍSTICAS =====

  const updateUserStats = useCallback(async (stats) => {
    if (!user) return;

    try {
      await supabaseApiService.updateUserStats(user.id, stats);
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
      return { success: false, error: error.message };
    }
  }, [user]);


  // ===== OBTER RANKING =====

  const getRanking = useCallback(async (limit = 50) => {
    try {
      const result = await supabaseApiService.getRanking(limit);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Erro ao obter ranking:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }, []);

  // ===== LIMPAR ERRO =====

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    // Estado
    user,
    profile,
    isLoggedIn,
    loading,
    error,
    
    // Ações
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    checkUsernameAvailability,
    updateUserStats,
    getRanking,
    clearError,
    loadGameDataFromSupabase
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
