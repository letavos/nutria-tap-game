-- Script para testar se o trigger está funcionando
-- Execute no SQL Editor do Supabase

-- 1. Verificar se o trigger existe e está ativo
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  trigger_schema
FROM information_schema.triggers 
WHERE event_object_table = 'users'
AND event_object_schema = 'auth';

-- 2. Verificar se a função existe
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- 3. Verificar permissões da função
SELECT 
  routine_name,
  security_type,
  definer
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- 4. Testar a função manualmente (simular criação de usuário)
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_meta_data JSONB := '{"username": "testuser123", "display_name": "Test User 123"}';
  user_created BOOLEAN := FALSE;
BEGIN
  RAISE NOTICE 'Iniciando teste de criação de usuário...';
  
  -- Simular inserção em auth.users
  INSERT INTO auth.users (
    id,
    email,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role
  ) VALUES (
    test_user_id,
    'test123@example.com',
    test_meta_data,
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  );
  
  RAISE NOTICE 'Usuário inserido em auth.users: %', test_user_id;
  
  -- Verificar se foi criado em public.users
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id = test_user_id) INTO user_created;
  
  IF user_created THEN
    RAISE NOTICE 'SUCESSO: Usuário foi criado em public.users!';
  ELSE
    RAISE NOTICE 'ERRO: Usuário NÃO foi criado em public.users!';
  END IF;
  
  -- Mostrar dados criados
  SELECT 
    id,
    username,
    email,
    display_name,
    referral_id
  FROM public.users 
  WHERE id = test_user_id;
  
  -- Limpar dados de teste
  DELETE FROM public.users WHERE id = test_user_id;
  DELETE FROM auth.users WHERE id = test_user_id;
  
  RAISE NOTICE 'Dados de teste removidos.';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'ERRO durante o teste: %', SQLERRM;
    
    -- Tentar limpar dados de teste mesmo em caso de erro
    BEGIN
      DELETE FROM public.users WHERE id = test_user_id;
      DELETE FROM auth.users WHERE id = test_user_id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao limpar dados de teste: %', SQLERRM;
    END;
END $$;

-- 5. Verificar logs recentes (se disponível)
SELECT 
  'Verifique os logs do Supabase para mensagens de LOG' as info;

-- 6. Verificar se há usuários órfãos após o teste
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

-- 7. Mostrar status final
SELECT 'Teste concluído! Verifique os resultados acima.' as status;
