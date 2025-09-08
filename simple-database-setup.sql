-- SCRIPT SIMPLES - APENAS O ESSENCIAL
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela users (se não existir)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    wallet_address VARCHAR(42),
    referral_id VARCHAR(8) UNIQUE,
    referred_by VARCHAR(8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela game_stats (se não existir)
CREATE TABLE IF NOT EXISTS public.game_stats (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    total_coins BIGINT DEFAULT 0,
    total_clicks BIGINT DEFAULT 0,
    level INTEGER DEFAULT 1,
    experience BIGINT DEFAULT 0,
    prestige_level INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    referrals JSONB DEFAULT '[]'::jsonb,
    last_click TIMESTAMP WITH TIME ZONE,
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela user_achievements (se não existir)
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- 4. Criar tabela user_upgrades (se não existir)
CREATE TABLE IF NOT EXISTS public.user_upgrades (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    upgrade_type VARCHAR(50) NOT NULL,
    level INTEGER DEFAULT 1,
    value DECIMAL(10,2) DEFAULT 1.0,
    cost BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, upgrade_type)
);

-- 5. Criar tabela daily_rewards (se não existir)
CREATE TABLE IF NOT EXISTS public.daily_rewards (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reward_date DATE NOT NULL,
    reward_amount BIGINT DEFAULT 0,
    streak_count INTEGER DEFAULT 1,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, reward_date)
);

-- 6. Criar view de ranking (se não existir)
-- Primeiro, remover a view se existir
DROP VIEW IF EXISTS public.ranking_view;

-- Agora criar a nova view
CREATE VIEW public.ranking_view AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.referral_id,
    gs.total_coins,
    gs.total_clicks,
    gs.level,
    gs.prestige_level,
    gs.max_streak,
    COALESCE(jsonb_array_length(gs.referrals), 0) as total_referrals,
    gs.last_sync,
    ROW_NUMBER() OVER (ORDER BY gs.total_coins DESC, gs.level DESC, gs.total_clicks DESC) as rank
FROM public.users u
LEFT JOIN public.game_stats gs ON u.id = gs.user_id
WHERE gs.total_coins > 0
ORDER BY gs.total_coins DESC, gs.level DESC, gs.total_clicks DESC;

-- 7. Habilitar RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas RLS básicas (apenas as essenciais)
-- Política para users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Política para game_stats
DROP POLICY IF EXISTS "Users can view own game stats" ON public.game_stats;
CREATE POLICY "Users can view own game stats" ON public.game_stats
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own game stats" ON public.game_stats;
CREATE POLICY "Users can update own game stats" ON public.game_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para user_achievements
DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
CREATE POLICY "Users can view own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

-- Política para user_upgrades
DROP POLICY IF EXISTS "Users can view own upgrades" ON public.user_upgrades;
CREATE POLICY "Users can view own upgrades" ON public.user_upgrades
    FOR SELECT USING (auth.uid() = user_id);

-- Política para daily_rewards
DROP POLICY IF EXISTS "Users can view own daily rewards" ON public.daily_rewards;
CREATE POLICY "Users can view own daily rewards" ON public.daily_rewards
    FOR SELECT USING (auth.uid() = user_id);

-- 9. Criar função para gerar referral_id único
CREATE OR REPLACE FUNCTION generate_referral_id()
RETURNS VARCHAR(8) AS $$
DECLARE
    new_id VARCHAR(8);
    exists_count INTEGER;
BEGIN
    LOOP
        -- Gerar ID aleatório de 8 caracteres
        new_id := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8));
        
        -- Verificar se já existe
        SELECT COUNT(*) INTO exists_count
        FROM public.users
        WHERE referral_id = new_id;
        
        -- Se não existe, sair do loop
        IF exists_count = 0 THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- 10. Criar trigger para gerar referral_id automaticamente
CREATE OR REPLACE FUNCTION set_referral_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_id IS NULL OR NEW.referral_id = '' THEN
        NEW.referral_id := generate_referral_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger se existir
DROP TRIGGER IF EXISTS trigger_set_referral_id ON public.users;

-- Criar trigger
CREATE TRIGGER trigger_set_referral_id
    BEFORE INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION set_referral_id();

-- 11. Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover triggers se existirem
DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS trigger_game_stats_updated_at ON public.game_stats;
DROP TRIGGER IF EXISTS trigger_user_upgrades_updated_at ON public.user_upgrades;

-- Criar triggers
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_game_stats_updated_at
    BEFORE UPDATE ON public.game_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_upgrades_updated_at
    BEFORE UPDATE ON public.user_upgrades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 12. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_referral_id ON public.users(referral_id);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users(referred_by);
CREATE INDEX IF NOT EXISTS idx_game_stats_user_id ON public.game_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_level ON public.game_stats(level);
CREATE INDEX IF NOT EXISTS idx_game_stats_total_coins ON public.game_stats(total_coins);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_upgrades_user_id ON public.user_upgrades(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_rewards_user_id ON public.daily_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_rewards_date ON public.daily_rewards(reward_date);

-- FIM DO SCRIPT
-- Execute este script e me confirme se funcionou!
