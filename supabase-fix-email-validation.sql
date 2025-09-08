-- Corrigir configurações de validação de email
-- Execute este script no Supabase SQL Editor

-- 1. Verificar configurações de autenticação atuais
-- NOTA: As configurações de auth são gerenciadas pelo painel do Supabase
-- Este script verifica apenas dados das tabelas públicas

-- 2. Verificar usuários com email não confirmado
-- NOTA: A tabela auth.users não é acessível via SQL público
-- Use o painel do Supabase para verificar usuários

-- 3. Verificar usuários na tabela pública users
SELECT 
    id,
    username,
    email,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- 4. Verificar se há usuários duplicados ou com problemas
SELECT 
    email,
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as user_ids
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- 5. Verificar se as colunas de referência existem
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('referral_id', 'referred_by')
ORDER BY column_name;

-- 6. Verificar configurações de RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('users', 'game_stats', 'user_achievements');

-- 7. Verificar se as políticas de RLS estão corretas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'game_stats', 'user_achievements');
