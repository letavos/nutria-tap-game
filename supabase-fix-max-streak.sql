-- Script corrigido para adicionar coluna max_streak na tabela game_stats

-- 1. Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'game_stats' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Adicionar coluna max_streak se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'game_stats' 
        AND column_name = 'max_streak'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.game_stats ADD COLUMN max_streak INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna max_streak adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna max_streak já existe';
    END IF;
END $$;

-- 3. Verificar se existe coluna streak e atualizar max_streak
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'game_stats' 
        AND column_name = 'streak'
        AND table_schema = 'public'
    ) THEN
        -- Atualizar max_streak com valor de streak
        UPDATE public.game_stats 
        SET max_streak = streak 
        WHERE max_streak = 0 AND streak > 0;
        RAISE NOTICE 'max_streak atualizado com valores de streak';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'game_stats' 
        AND column_name = 'current_streak'
        AND table_schema = 'public'
    ) THEN
        -- Atualizar max_streak com valor de current_streak
        UPDATE public.game_stats 
        SET max_streak = current_streak 
        WHERE max_streak = 0 AND current_streak > 0;
        RAISE NOTICE 'max_streak atualizado com valores de current_streak';
    ELSE
        RAISE NOTICE 'Nenhuma coluna de streak encontrada, max_streak permanece com valor padrão 0';
    END IF;
END $$;

-- 4. Adicionar comentário na coluna
COMMENT ON COLUMN public.game_stats.max_streak IS 'Maior streak consecutivo do usuário';

-- 5. Verificar resultado final
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'game_stats' 
AND table_schema = 'public'
AND column_name IN ('max_streak', 'streak', 'current_streak')
ORDER BY column_name;

-- 6. Mostrar alguns registros para verificar
SELECT user_id, total_coins, level, max_streak, streak, current_streak
FROM public.game_stats 
LIMIT 5;
