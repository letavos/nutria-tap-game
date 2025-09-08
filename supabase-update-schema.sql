-- Script de ATUALIZAÇÃO do schema para autenticação completa
-- Execute este script se você já tem o schema anterior

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== ATUALIZAR TABELA USERS EXISTENTE =====

-- Adicionar colunas que podem estar faltando
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Se a tabela users não tem a coluna id como PRIMARY KEY, vamos ajustar
DO $$
BEGIN
    -- Verificar se a coluna id existe e é PRIMARY KEY
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_type = 'PRIMARY KEY' 
        AND table_name = 'users' 
        AND table_schema = 'public'
    ) THEN
        -- Adicionar constraint de PRIMARY KEY se não existir
        ALTER TABLE public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
    END IF;
END $$;

-- ===== CRIAR TABELA PROFILES (NOVA) =====

CREATE TABLE IF NOT EXISTS public.profiles (
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

-- ===== ATUALIZAR TABELA GAME_STATS =====

-- Adicionar colunas que podem estar faltando
ALTER TABLE public.game_stats 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4(),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Ajustar PRIMARY KEY se necessário
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_type = 'PRIMARY KEY' 
        AND table_name = 'game_stats' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.game_stats ADD CONSTRAINT game_stats_pkey PRIMARY KEY (id);
    END IF;
END $$;

-- ===== ATUALIZAR OUTRAS TABELAS =====

-- user_upgrades
ALTER TABLE public.user_upgrades 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4(),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- user_achievements
ALTER TABLE public.user_achievements 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4(),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- daily_rewards
ALTER TABLE public.daily_rewards 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4(),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ===== CRIAR/ATUALIZAR VIEW DE RANKING =====

-- Dropar view existente se existir
DROP MATERIALIZED VIEW IF EXISTS public.ranking_view;

-- Criar nova view
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

-- ===== CRIAR ÍNDICES =====

-- Índices para performance (usar IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_public ON public.profiles(is_public);

-- ===== FUNÇÕES =====

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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
  )
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.users (id, username, email, wallet_address, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'wallet_address',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    wallet_address = EXCLUDED.wallet_address,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  
  INSERT INTO public.game_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Função para refresh do ranking
CREATE OR REPLACE FUNCTION refresh_ranking()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW public.ranking_view;
END;
$$ language 'plpgsql';

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

-- ===== TRIGGERS =====

-- Dropar triggers existentes se existirem
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_game_stats_updated_at ON public.game_stats;
DROP TRIGGER IF EXISTS update_user_upgrades_updated_at ON public.user_upgrades;

-- Criar novos triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_stats_updated_at 
  BEFORE UPDATE ON public.game_stats 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_upgrades_updated_at 
  BEFORE UPDATE ON public.user_upgrades 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== POLÍTICAS DE SEGURANÇA (RLS) =====

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;

-- Dropar políticas existentes se existirem
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Game stats are viewable by everyone" ON public.game_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON public.game_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON public.game_stats;
DROP POLICY IF EXISTS "User upgrades are viewable by everyone" ON public.user_upgrades;
DROP POLICY IF EXISTS "Users can update own upgrades" ON public.user_upgrades;
DROP POLICY IF EXISTS "Users can insert own upgrades" ON public.user_upgrades;
DROP POLICY IF EXISTS "User achievements are viewable by everyone" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Daily rewards are viewable by everyone" ON public.daily_rewards;
DROP POLICY IF EXISTS "Users can insert own rewards" ON public.daily_rewards;

-- Criar novas políticas
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Game stats are viewable by everyone" ON public.game_stats FOR SELECT USING (true);
CREATE POLICY "Users can update own stats" ON public.game_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON public.game_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User upgrades are viewable by everyone" ON public.user_upgrades FOR SELECT USING (true);
CREATE POLICY "Users can update own upgrades" ON public.user_upgrades FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own upgrades" ON public.user_upgrades FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User achievements are viewable by everyone" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Daily rewards are viewable by everyone" ON public.daily_rewards FOR SELECT USING (true);
CREATE POLICY "Users can insert own rewards" ON public.daily_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===== MIGRAR DADOS EXISTENTES =====

-- Migrar dados da tabela users antiga para profiles (se necessário)
INSERT INTO public.profiles (id, username, display_name, wallet_address, avatar_url)
SELECT 
  gen_random_uuid() as id,  -- Gerar UUID temporário
  username,
  username as display_name,
  wallet_address,
  avatar_url
FROM public.users 
WHERE id IS NULL  -- Apenas registros sem ID do auth.users
ON CONFLICT (username) DO NOTHING;

-- ===== FINALIZAR =====

-- Refresh da view de ranking
SELECT refresh_ranking();

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Schema atualizado com sucesso! Autenticação configurada.';
END $$;
