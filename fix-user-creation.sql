-- Script para corrigir criação de usuários no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela users existe e tem a estrutura correta
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se há triggers na tabela users
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users'
AND event_object_schema = 'public';

-- 3. Verificar se a função de criação de usuário existe
SELECT routine_name, routine_type, routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%user%' 
AND routine_schema = 'public';

-- 4. Recriar a função de criação de usuário (se necessário)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, username, email, display_name, wallet_address, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'wallet_address',
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se o usuário já existe, apenas atualizar
    UPDATE public.users 
    SET 
      username = COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
      email = NEW.email,
      display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
      wallet_address = NEW.raw_user_meta_data->>'wallet_address',
      avatar_url = NEW.raw_user_meta_data->>'avatar_url',
      updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log do erro e retornar NULL para evitar que a criação de usuário falhe
    RAISE LOG 'Erro ao criar usuário: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Recriar o trigger (se necessário)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Verificar se o trigger foi criado corretamente
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users'
AND event_object_schema = 'auth';

-- 7. Testar a função manualmente (opcional)
-- SELECT public.handle_new_user();

-- 8. Verificar permissões da tabela users
SELECT grantee, privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'users' 
AND table_schema = 'public';

-- 9. Garantir que o serviço de auth tem permissão para inserir na tabela users
GRANT INSERT, UPDATE, SELECT ON public.users TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- 10. Verificar se há constraints que podem estar causando problemas
SELECT constraint_name, constraint_type, table_name
FROM information_schema.table_constraints 
WHERE table_name = 'users' 
AND table_schema = 'public';
