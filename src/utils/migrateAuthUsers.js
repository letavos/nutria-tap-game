// Utilitário para migrar usuários do sistema de auth para a tabela users
import { supabase } from '../config/supabase';

export const migrateAuthUsers = async () => {
  try {
    console.log('Iniciando migração de usuários do sistema de auth...');
    
    // 1. Obter usuários do sistema de auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Erro ao obter usuários do auth:', authError);
      return { success: false, error: authError.message };
    }
    
    console.log(`Encontrados ${users.length} usuários no sistema de auth`);
    
    // 2. Verificar quais usuários já existem na tabela users
    const userIds = users.map(user => user.id);
    const { data: existingUsers, error: existingError } = await supabase
      .from('users')
      .select('id')
      .in('id', userIds);
    
    if (existingError) {
      console.error('Erro ao verificar usuários existentes:', existingError);
      return { success: false, error: existingError.message };
    }
    
    const existingUserIds = existingUsers.map(user => user.id);
    const usersToMigrate = users.filter(user => !existingUserIds.includes(user.id));
    
    console.log(`${usersToMigrate.length} usuários precisam ser migrados`);
    
    if (usersToMigrate.length === 0) {
      return { success: true, message: 'Todos os usuários já estão migrados' };
    }
    
    // 3. Migrar usuários para a tabela users
    const usersData = usersToMigrate.map(user => ({
      id: user.id,
      username: user.user_metadata?.username || user.email?.split('@')[0] || `user_${user.id.substring(0, 8)}`,
      email: user.email,
      created_at: user.created_at,
      updated_at: new Date().toISOString()
    }));
    
    const { error: insertError } = await supabase
      .from('users')
      .insert(usersData);
    
    if (insertError) {
      console.error('Erro ao inserir usuários:', insertError);
      return { success: false, error: insertError.message };
    }
    
    console.log(`${usersData.length} usuários migrados com sucesso`);
    
    // 4. Criar game_stats para os usuários migrados
    const gameStatsData = usersData.map(user => ({
      user_id: user.id,
      total_coins: 0,
      total_clicks: 0,
      level: 1,
      experience: 0,
      prestige_level: 0,
      streak: 0,
      max_streak: 0,
      referrals: '[]',
      last_click: new Date().toISOString(),
      last_sync: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    const { error: gameStatsError } = await supabase
      .from('game_stats')
      .insert(gameStatsData);
    
    if (gameStatsError) {
      console.error('Erro ao criar game_stats:', gameStatsError);
      return { success: false, error: gameStatsError.message };
    }
    
    console.log(`${gameStatsData.length} game_stats criados com sucesso`);
    
    return { 
      success: true, 
      message: `${usersData.length} usuários migrados com sucesso`,
      migrated: usersData.length
    };
    
  } catch (error) {
    console.error('Erro na migração:', error);
    return { success: false, error: error.message };
  }
};

// Função para executar migração manualmente
export const runMigration = async () => {
  const result = await migrateAuthUsers();
  console.log('Resultado da migração:', result);
  return result;
};
