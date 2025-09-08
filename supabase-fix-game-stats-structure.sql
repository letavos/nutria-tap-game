-- Script para corrigir estrutura da tabela game_stats

-- 1. Renomear coluna prestige_level_streak para prestige_level
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'game_stats' 
        AND column_name = 'prestige_level_streak'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.game_stats RENAME COLUMN prestige_level_streak TO prestige_level;
        RAISE NOTICE 'Coluna prestige_level_streak renomeada para prestige_level';
    END IF;
END $$;

-- 2. Adicionar coluna streak se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'game_stats' 
        AND column_name = 'streak'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.game_stats ADD COLUMN streak INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna streak adicionada';
    END IF;
END $$;

-- 3. Adicionar coluna max_streak se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'game_stats' 
        AND column_name = 'max_streak'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.game_stats ADD COLUMN max_streak INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna max_streak adicionada';
    END IF;
END $$;

-- 4. Adicionar coluna total_achievements se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'game_stats' 
        AND column_name = 'total_achievements'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.game_stats ADD COLUMN total_achievements INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna total_achievements adicionada';
    END IF;
END $$;

-- 5. Atualizar max_streak com valor de streak (se existir)
UPDATE public.game_stats 
SET max_streak = streak 
WHERE max_streak = 0 AND streak > 0;

-- 6. Adicionar comentários nas colunas
COMMENT ON COLUMN public.game_stats.streak IS 'Streak atual do usuário';
COMMENT ON COLUMN public.game_stats.max_streak IS 'Maior streak consecutivo do usuário';
COMMENT ON COLUMN public.game_stats.total_achievements IS 'Total de conquistas desbloqueadas';
COMMENT ON COLUMN public.game_stats.prestige_level IS 'Nível de prestígio do usuário';

-- 7. Verificar estrutura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'game_stats' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Mostrar dados atualizados
SELECT 
    user_id,
    total_coins,
    total_clicks,
    level,
    experience,
    prestige_level,
    streak,
    max_streak,
    total_achievements,
    last_click,
    last_sync
FROM public.game_stats 
LIMIT 5;
