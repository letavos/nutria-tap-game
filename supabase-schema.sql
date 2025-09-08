-- Schema do Banco de Dados para Nutria Tap PWA

-- Tabela de Usuários
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  wallet_address VARCHAR(42) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Estatísticas do Jogo
CREATE TABLE game_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_coins DECIMAL(20,2) DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  prestige_level INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_click TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Upgrades
CREATE TABLE user_upgrades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  upgrade_type VARCHAR(50) NOT NULL,
  level INTEGER DEFAULT 1,
  cost DECIMAL(20,2) DEFAULT 0,
  value DECIMAL(20,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, upgrade_type)
);

-- Tabela de Conquistas
CREATE TABLE user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(100) NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Tabela de Recompensas Diárias
CREATE TABLE daily_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reward_date DATE NOT NULL,
  reward_type VARCHAR(50) NOT NULL,
  reward_value DECIMAL(20,2) DEFAULT 0,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, reward_date)
);

-- Tabela de Ranking (View materializada)
CREATE MATERIALIZED VIEW ranking_view AS
SELECT 
  u.id,
  u.username,
  u.wallet_address,
  gs.total_coins,
  gs.level,
  gs.total_clicks,
  gs.streak,
  gs.prestige_level,
  ROW_NUMBER() OVER (ORDER BY gs.total_coins DESC) as rank,
  gs.last_sync
FROM users u
JOIN game_stats gs ON u.id = gs.user_id
WHERE gs.total_coins > 0
ORDER BY gs.total_coins DESC;

-- Índices para performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_game_stats_user_id ON game_stats(user_id);
CREATE INDEX idx_game_stats_total_coins ON game_stats(total_coins DESC);
CREATE INDEX idx_user_upgrades_user_id ON user_upgrades(user_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_daily_rewards_user_id ON daily_rewards(user_id);
CREATE INDEX idx_daily_rewards_date ON daily_rewards(reward_date);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_game_stats_updated_at BEFORE UPDATE ON game_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_upgrades_updated_at BEFORE UPDATE ON user_upgrades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para refresh do ranking
CREATE OR REPLACE FUNCTION refresh_ranking()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW ranking_view;
END;
$$ language 'plpgsql';

-- Políticas de Segurança (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_rewards ENABLE ROW LEVEL SECURITY;

-- Política para usuários (podem ver todos, mas só editar próprios)
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Política para game_stats
CREATE POLICY "Users can view all stats" ON game_stats FOR SELECT USING (true);
CREATE POLICY "Users can update own stats" ON game_stats FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Política para user_upgrades
CREATE POLICY "Users can view all upgrades" ON user_upgrades FOR SELECT USING (true);
CREATE POLICY "Users can update own upgrades" ON user_upgrades FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Política para user_achievements
CREATE POLICY "Users can view all achievements" ON user_achievements FOR SELECT USING (true);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Política para daily_rewards
CREATE POLICY "Users can view all rewards" ON daily_rewards FOR SELECT USING (true);
CREATE POLICY "Users can insert own rewards" ON daily_rewards FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
