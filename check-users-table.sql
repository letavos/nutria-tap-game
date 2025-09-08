-- Script para verificar estrutura da tabela users
-- Execute no SQL Editor do Supabase

-- 1. Verificar se a tabela users existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
) as table_exists;

-- 2. Verificar estrutura da tabela users
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar constraints da tabela users
SELECT 
  constraint_name,
  constraint_type,
  column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users' 
AND tc.table_schema = 'public';

-- 4. Verificar se há dados na tabela users
SELECT COUNT(*) as total_users FROM public.users;

-- 5. Verificar se há usuários órfãos (sem entrada em auth.users)
SELECT COUNT(*) as orphaned_users
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NULL;

-- 6. Verificar permissões da tabela users
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'users' 
AND table_schema = 'public';

-- 7. Verificar se o RLS está ativado
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  hasrls
FROM pg_tables 
WHERE tablename = 'users' 
AND schemaname = 'public';

-- 8. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users' 
AND schemaname = 'public';
