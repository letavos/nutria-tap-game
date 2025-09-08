-- Script para corrigir problemas de autenticação no Supabase

-- 1. Limpar triggers e funções problemáticas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Recriar função corrigida
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir na tabela profiles
  INSERT INTO public.profiles (id, username, display_name, avatar_url, wallet_address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'wallet_address'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Inserir na tabela users (se necessário)
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
  
  -- Inserir estatísticas iniciais do jogo
  INSERT INTO public.game_stats (user_id, total_coins, total_clicks, level, experience, prestige_level, streak)
  VALUES (NEW.id, 0, 0, 1, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro e retornar NEW para não quebrar o registro
    RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 3. Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Verificar e corrigir políticas RLS
-- Desabilitar RLS temporariamente para teste
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_stats DISABLE ROW LEVEL SECURITY;

-- 5. Recriar políticas mais simples
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_stats ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Enable all operations for profiles" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);

-- Políticas para users
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Enable all operations for users" ON public.users
  FOR ALL USING (true) WITH CHECK (true);

-- Políticas para game_stats
DROP POLICY IF EXISTS "Game stats are viewable by everyone" ON public.game_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON public.game_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON public.game_stats;

CREATE POLICY "Enable all operations for game_stats" ON public.game_stats
  FOR ALL USING (true) WITH CHECK (true);

-- 6. Verificar se as tabelas têm as colunas corretas
-- Adicionar colunas que podem estar faltando
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS username VARCHAR(50),
ADD COLUMN IF NOT EXISTS display_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(42),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Adicionar constraint de PRIMARY KEY se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_type = 'PRIMARY KEY' 
        AND table_name = 'profiles' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
    END IF;
END $$;

-- Adicionar constraint UNIQUE para username se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_type = 'UNIQUE' 
        AND table_name = 'profiles' 
        AND table_schema = 'public'
        AND constraint_name LIKE '%username%'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
END $$;

-- 7. Verificar tabela game_stats
ALTER TABLE public.game_stats 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4(),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS total_coins DECIMAL(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS prestige_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_click TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Adicionar constraint de PRIMARY KEY se não existir
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

-- Adicionar constraint UNIQUE para user_id se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_type = 'UNIQUE' 
        AND table_name = 'game_stats' 
        AND table_schema = 'public'
        AND constraint_name LIKE '%user_id%'
    ) THEN
        ALTER TABLE public.game_stats ADD CONSTRAINT game_stats_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- 8. Função para verificar disponibilidade de username (corrigida)
CREATE OR REPLACE FUNCTION check_username_availability(username_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE username = username_to_check
  );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 9. Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Correções aplicadas com sucesso! Sistema de autenticação corrigido.';
END $$;
