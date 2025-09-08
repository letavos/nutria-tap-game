-- Script simples para verificar e corrigir problemas de email
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuários na tabela pública
SELECT 
    id,
    username,
    email,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- 2. Verificar se as colunas de referência existem
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('referral_id', 'referred_by')
ORDER BY column_name;

-- 3. Verificar se as colunas de game_stats existem
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'game_stats' 
AND column_name IN ('referrals', 'max_streak')
ORDER BY column_name;

-- 4. Verificar políticas de RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users', 'game_stats', 'user_achievements')
ORDER BY tablename, policyname;

-- 5. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'game_stats', 'user_achievements')
ORDER BY tablename;

-- 6. Verificar se a view de ranking existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'ranking_view';

-- 7. Testar inserção de usuário (simulação)
-- NOTA: Não execute este INSERT, é apenas para verificar permissões
-- INSERT INTO users (username, email) VALUES ('test_user', 'test@example.com');
