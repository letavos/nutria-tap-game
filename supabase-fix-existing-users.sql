-- Corrigir usuários existentes que não têm referral_id
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuários sem referral_id
SELECT 
    id, 
    username, 
    email, 
    referral_id,
    created_at
FROM users 
WHERE referral_id IS NULL OR referral_id = ''
ORDER BY created_at;

-- 2. Atualizar usuários existentes com referral_id
UPDATE users 
SET referral_id = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))
WHERE referral_id IS NULL OR referral_id = '';

-- 3. Verificar se a atualização funcionou
SELECT 
    id, 
    username, 
    email, 
    referral_id,
    created_at
FROM users 
ORDER BY created_at;

-- 4. Verificar se as colunas existem na tabela game_stats
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'game_stats' 
AND column_name IN ('referrals', 'max_streak')
ORDER BY column_name;

-- 5. Atualizar game_stats para usuários existentes
UPDATE game_stats 
SET referrals = '[]'::jsonb
WHERE referrals IS NULL;

UPDATE game_stats 
SET max_streak = 0
WHERE max_streak IS NULL;
