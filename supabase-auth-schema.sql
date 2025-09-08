-- Schema atualizado para autenticação completa com Supabase

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários (integrada com auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  wallet_address VARCHAR(42),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de perfis públicos
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  wallet_address VARCHAR(42),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de estatísticas do jogo
CREATE TABLE public.game_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Tabela de upgrades
CREATE TABLE public.user_upgrades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  upgrade_type VARCHAR(50) NOT NULL,
  level INTEGER DEFAULT 1,
  cost DECIMAL(20,2) DEFAULT 0,
  value DECIMAL(20,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, upgrade_type)
);

-- Tabela de conquistas
CREATE TABLE public.user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(100) NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Tabela de recompensas diárias
CREATE TABLE public.daily_rewards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_date DATE NOT NULL,
  reward_type VARCHAR(50) NOT NULL,
  reward_value DECIMAL(20,2) DEFAULT 0,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, reward_date)
);

-- View materializada para ranking
CREATE MATERIALIZED VIEW public.ranking_view AS
SELECT 
  u.id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.wallet_address,
  gs.total_coins,
  gs.level,
  gs.total_clicks,
  gs.streak,
  gs.prestige_level,
  ROW_NUMBER() OVER (ORDER BY gs.total_coins DESC) as rank,
  gs.last_sync
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.game_stats gs ON u.id = gs.user_id
WHERE gs.total_coins > 0
ORDER BY gs.total_coins DESC;

-- Índices para performance
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_public ON public.profiles(is_public);
CREATE INDEX idx_game_stats_user_id ON public.game_stats(user_id);
CREATE INDEX idx_game_stats_total_coins ON public.game_stats(total_coins DESC);
CREATE INDEX idx_user_upgrades_user_id ON public.user_upgrades(user_id);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_daily_rewards_user_id ON public.daily_rewards(user_id);
CREATE INDEX idx_daily_rewards_date ON public.daily_rewards(reward_date);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_game_stats_updated_at BEFORE UPDATE ON public.game_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_upgrades_updated_at BEFORE UPDATE ON public.user_upgrades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url, wallet_address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'wallet_address'
  );
  
  INSERT INTO public.users (id, username, email, wallet_address, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'wallet_address',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.game_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para refresh do ranking
CREATE OR REPLACE FUNCTION refresh_ranking()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW public.ranking_view;
END;
$$ language 'plpgsql';

-- Políticas de Segurança (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Políticas para profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para game_stats
CREATE POLICY "Game stats are viewable by everyone" ON public.game_stats FOR SELECT USING (true);
CREATE POLICY "Users can update own stats" ON public.game_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON public.game_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para user_upgrades
CREATE POLICY "User upgrades are viewable by everyone" ON public.user_upgrades FOR SELECT USING (true);
CREATE POLICY "Users can update own upgrades" ON public.user_upgrades FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own upgrades" ON public.user_upgrades FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para user_achievements
CREATE POLICY "User achievements are viewable by everyone" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para daily_rewards
CREATE POLICY "Daily rewards are viewable by everyone" ON public.daily_rewards FOR SELECT USING (true);
CREATE POLICY "Users can insert own rewards" ON public.daily_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Função para verificar disponibilidade de username
CREATE OR REPLACE FUNCTION check_username_availability(username_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE username = username_to_check
  );
END;
$$ language 'plpgsql' SECURITY DEFINER;
