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

  // Inicializar autenticação e escutar mudanças
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Aguardar inicialização do auth
        await authService.waitForAuth();
        
        const currentUser = authService.getCurrentUser();
        
        if (currentUser) {
          // Carregar perfil do usuário
          const profileResult = await authService.getUserProfile();
          if (profileResult.success) {
            setUser(currentUser);
            setProfile(profileResult.profile);
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar auth:', error);
        setError('Erro ao carregar dados do usuário');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Escutar mudanças de autenticação do Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ Usuário logado via listener');
        setUser(session.user);
        setIsLoggedIn(true);
        
        // Carregar perfil
        try {
          const profileResult = await authService.getUserProfile();
          if (profileResult.success) {
            setProfile(profileResult.profile);
          }
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('❌ Usuário deslogado via listener');
        setUser(null);
        setProfile(null);
        setIsLoggedIn(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('🔄 Token renovado');
        setUser(session.user);
        setIsLoggedIn(true);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
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
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
