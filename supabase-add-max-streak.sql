-- Script para adicionar coluna max_streak na tabela game_stats

-- Adicionar coluna max_streak se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'game_stats' 
        AND column_name = 'max_streak'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.game_stats ADD COLUMN max_streak INTEGER DEFAULT 0;
    END IF;
END $$;

-- Atualizar registros existentes para usar streak como max_streak se max_streak for 0
UPDATE public.game_stats 
SET max_streak = streak 
WHERE max_streak = 0 AND streak > 0;

-- Adicionar comentário na coluna
COMMENT ON COLUMN public.game_stats.max_streak IS 'Maior streak consecutivo do usuário';

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'game_stats' 
AND table_schema = 'public'
AND column_name IN ('max_streak', 'current_streak')
ORDER BY column_name;
