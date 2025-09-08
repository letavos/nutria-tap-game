-- Corrigir view de ranking para incluir dados de referência
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a view existe e suas colunas
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'ranking_view'
ORDER BY ordinal_position;

-- 2. Dropar a view existente (se existir)
DROP VIEW IF EXISTS ranking_view;
DROP MATERIALIZED VIEW IF EXISTS ranking_view;

-- 3. Criar nova view de ranking com dados de referência
CREATE VIEW ranking_view AS
SELECT 
    u.id,
    u.username,
    u.wallet_address,
    u.referral_id,
    gs.total_coins,
    gs.level,
    gs.total_clicks,
    gs.streak,
    gs.max_streak,
    gs.prestige_level,
    COALESCE(jsonb_array_length(gs.referrals), 0) as total_referrals,
    ROW_NUMBER() OVER (ORDER BY gs.total_coins DESC) as rank,
    gs.last_sync
FROM users u
JOIN game_stats gs ON u.id = gs.user_id
WHERE gs.total_coins > 0
ORDER BY gs.total_coins DESC;

-- 4. Verificar se a view foi criada corretamente
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'ranking_view'
ORDER BY ordinal_position;

-- 5. Testar a view com alguns dados
SELECT * FROM ranking_view LIMIT 5;
