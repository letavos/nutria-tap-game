// Serviço de Autenticação Manual (Fallback)
import { supabase } from '../config/supabase.js'

class ManualAuthService {
  // Registrar usuário manualmente (sem trigger)
  async signUpManual(userData) {
    try {
      console.log('Registro manual iniciado:', userData);
      
      // 1. Criar usuário no auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
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

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Usuário não foi criado');
      }

      console.log('Usuário criado no auth:', authData.user.id);

      // 2. Criar perfil manualmente
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          username: userData.username,
          display_name: userData.displayName || userData.username,
          wallet_address: userData.walletAddress,
          avatar_url: userData.avatarUrl
        }]);

      if (profileError) {
        console.warn('Erro ao criar perfil:', profileError);
        // Não falhar se o perfil já existe
      }

      // 3. Criar estatísticas do jogo
      const { error: statsError } = await supabase
        .from('game_stats')
        .insert([{
          user_id: authData.user.id,
          total_coins: 0,
          total_clicks: 0,
          level: 1,
          experience: 0,
          prestige_level: 0,
          streak: 0
        }]);

      if (statsError) {
        console.warn('Erro ao criar estatísticas:', statsError);
        // Não falhar se as estatísticas já existem
      }

      // 4. Criar entrada na tabela users
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          username: userData.username,
          email: userData.email,
          wallet_address: userData.walletAddress,
          avatar_url: userData.avatarUrl
        }]);

      if (userError) {
        console.warn('Erro ao criar entrada de usuário:', userError);
        // Não falhar se o usuário já existe
      }

      console.log('Registro manual concluído com sucesso');

      return {
        success: true,
        message: 'Conta criada com sucesso!',
        user: authData.user,
        session: authData.session
      };

    } catch (error) {
      console.error('Erro no registro manual:', error);
      return {
        success: false,
        error: error.message || 'Erro ao criar conta'
      };
    }
  }
}

const manualAuthService = new ManualAuthService();
export default manualAuthService;
