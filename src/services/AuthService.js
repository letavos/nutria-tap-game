// Serviço de Autenticação com Supabase
import { supabase } from '../config/supabase.js'

class AuthService {
  constructor() {
    this.currentUser = null;
    this.setupAuthListener();
  }

  // Configurar listener para mudanças de autenticação
  setupAuthListener() {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      this.currentUser = session?.user || null;
      
      if (event === 'SIGNED_IN') {
        console.log('Usuário logado:', this.currentUser);
      } else if (event === 'SIGNED_OUT') {
        console.log('Usuário deslogado');
        this.currentUser = null;
      }
    });
  }

  // Obter usuário atual
  getCurrentUser() {
    return this.currentUser;
  }

  // Verificar se está logado
  isAuthenticated() {
    return !!this.currentUser;
  }

  // ===== REGISTRO =====

  // Registrar novo usuário
  async signUp(userData) {
    try {
      console.log('Tentando registrar usuário:', userData);
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username,
            display_name: userData.displayName || userData.username,
            wallet_address: userData.walletAddress,
            avatar_url: userData.avatarUrl
          }
        }
      });

      console.log('Resposta do Supabase:', { data, error });

      if (error) throw error;

      // Aguardar confirmação de email se necessário
      if (data.user && !data.session) {
        return {
          success: true,
          message: 'Verifique seu email para confirmar a conta',
          user: data.user,
          needsEmailConfirmation: true
        };
      }

      return {
        success: true,
        message: 'Conta criada com sucesso!',
        user: data.user,
        session: data.session
      };
    } catch (error) {
      console.error('Erro no registro:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // ===== LOGIN =====

  // Login com email e senha
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Login realizado com sucesso!',
        user: data.user,
        session: data.session
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Login com Google
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Redirecionando para Google...',
        data
      };
    } catch (error) {
      console.error('Erro no login com Google:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // ===== LOGOUT =====

  // Deslogar usuário
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return {
        success: true,
        message: 'Logout realizado com sucesso!'
      };
    } catch (error) {
      console.error('Erro no logout:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // ===== RECUPERAÇÃO DE SENHA =====

  // Enviar email de recuperação
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Email de recuperação enviado!'
      };
    } catch (error) {
      console.error('Erro na recuperação:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Atualizar senha
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Senha atualizada com sucesso!'
      };
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // ===== PERFIL =====

  // Atualizar perfil
  async updateProfile(updates) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) throw error;

      // Atualizar também na tabela users
      const { error: profileError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', this.currentUser.id);

      if (profileError) {
        console.warn('Erro ao atualizar perfil público:', profileError);
      }

      return {
        success: true,
        message: 'Perfil atualizado com sucesso!',
        user: data.user
      };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // ===== UTILITÁRIOS =====

  // Verificar disponibilidade de username
  async checkUsernameAvailability(username) {
    try {
      const { data, error } = await supabase
        .rpc('check_username_availability', { username_to_check: username });

      if (error) throw error;

      return {
        success: true,
        available: data
      };
    } catch (error) {
      console.error('Erro ao verificar username:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Obter perfil do usuário
  async getUserProfile(userId = null) {
    try {
      const targetUserId = userId || this.currentUser?.id;
      if (!targetUserId) {
        throw new Error('ID do usuário não fornecido');
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (error) throw error;

      return {
        success: true,
        profile: data
      };
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  // Converter mensagens de erro
  getErrorMessage(error) {
    const errorMessages = {
      'Invalid login credentials': 'Email ou senha incorretos',
      'User already registered': 'Usuário já cadastrado',
      'Email not confirmed': 'Email não confirmado',
      'Password should be at least 6 characters': 'Senha deve ter pelo menos 6 caracteres',
      'Unable to validate email address: invalid format': 'Formato de email inválido',
      'Username already taken': 'Nome de usuário já está em uso'
    };

    return errorMessages[error.message] || error.message || 'Erro desconhecido';
  }

  // Aguardar inicialização
  async waitForAuth() {
    return new Promise((resolve) => {
      const checkAuth = () => {
        if (this.currentUser !== undefined) {
          resolve(this.currentUser);
        } else {
          setTimeout(checkAuth, 100);
        }
      };
      checkAuth();
    });
  }
}

const authService = new AuthService();
export default authService;
