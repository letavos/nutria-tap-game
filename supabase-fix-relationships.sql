-- Verificar e corrigir relacionamentos entre tabelas
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'game_stats', 'user_achievements', 'user_upgrades', 'daily_rewards')
ORDER BY table_name;

-- 2. Verificar relacionamentos existentes
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema='public'
AND tc.table_name IN ('game_stats', 'user_achievements', 'user_upgrades', 'daily_rewards')
ORDER BY tc.table_name, kcu.column_name;

-- 3. Verificar se as colunas de chave estrangeira existem
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('game_stats', 'user_achievements', 'user_upgrades', 'daily_rewards')
AND column_name LIKE '%user_id%'
ORDER BY table_name, column_name;

-- 4. Se necessário, adicionar chaves estrangeiras
-- (Execute apenas se não existirem)

-- Adicionar FK para game_stats
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'game_stats_user_id_fkey'
    ) THEN
        ALTER TABLE game_stats 
        ADD CONSTRAINT game_stats_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Adicionar FK para user_achievements
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_achievements_user_id_fkey'
    ) THEN
        ALTER TABLE user_achievements 
        ADD CONSTRAINT user_achievements_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Adicionar FK para user_upgrades
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_upgrades_user_id_fkey'
    ) THEN
        ALTER TABLE user_upgrades 
        ADD CONSTRAINT user_upgrades_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Adicionar FK para daily_rewards
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'daily_rewards_user_id_fkey'
    ) THEN
        ALTER TABLE daily_rewards 
        ADD CONSTRAINT daily_rewards_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. Verificar se as FKs foram criadas
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema='public'
AND tc.table_name IN ('game_stats', 'user_achievements', 'user_upgrades', 'daily_rewards')
ORDER BY tc.table_name, kcu.column_name;
