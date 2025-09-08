-- Script para testar criação de usuários
-- Execute no SQL Editor do Supabase

-- 1. Verificar se o trigger existe
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users'
AND event_object_schema = 'auth';

-- 2. Verificar se a função existe
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- 3. Verificar estrutura da tabela users
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar permissões
SELECT 
  grantee,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'users' 
AND table_schema = 'public';

-- 5. Verificar políticas RLS
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'users' 
AND schemaname = 'public';

-- 6. Testar a função manualmente (simular criação de usuário)
-- Descomente as linhas abaixo para testar
/*
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_meta_data JSONB := '{"username": "testuser", "display_name": "Test User"}';
BEGIN
  -- Simular inserção em auth.users
  INSERT INTO auth.users (
    id,
    email,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    test_user_id,
    'test@example.com',
    test_meta_data,
    NOW(),
    NOW()
  );
  
  -- Verificar se foi criado em public.users
  IF EXISTS (SELECT 1 FROM public.users WHERE id = test_user_id) THEN
    RAISE NOTICE 'Usuário criado com sucesso!';
  ELSE
    RAISE NOTICE 'Erro: Usuário não foi criado em public.users';
  END IF;
  
  -- Limpar dados de teste
  DELETE FROM public.users WHERE id = test_user_id;
  DELETE FROM auth.users WHERE id = test_user_id;
END $$;
*/

-- 7. Verificar se há usuários órfãos
SELECT 
  COUNT(*) as total_auth_users
FROM auth.users;

SELECT 
  COUNT(*) as total_public_users
FROM public.users;

-- 8. Verificar se há inconsistências
SELECT 
  'Usuários em auth.users sem entrada em public.users' as issue,
  COUNT(*) as count
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL

UNION ALL

SELECT 
  'Usuários em public.users sem entrada em auth.users' as issue,
  COUNT(*) as count
FROM public.users pu
LEFT JOIN auth.users au ON pu.id = au.id
WHERE au.id IS NULL;
