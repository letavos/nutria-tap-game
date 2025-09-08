-- Script para verificar estrutura da tabela game_stats

-- Verificar todas as colunas da tabela game_stats
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'game_stats' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se existem dados na tabela
SELECT COUNT(*) as total_records FROM public.game_stats;

-- Verificar alguns registros de exemplo
SELECT * FROM public.game_stats LIMIT 3;
