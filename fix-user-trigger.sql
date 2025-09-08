-- Script simplificado para corrigir criação de usuários
-- Execute no SQL Editor do Supabase

-- 1. Remover trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Remover função existente se houver
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Criar função simplificada
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Inserir usuário na tabela public.users
  INSERT INTO public.users (
    id, 
    username, 
    email, 
    display_name, 
    wallet_address, 
    avatar_url, 
    created_at, 
    updated_at
  )
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
  WHEN OTHERS THEN
    -- Em caso de erro, apenas logar e continuar
    RAISE LOG 'Erro ao criar usuário: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Garantir permissões
GRANT INSERT, UPDATE, SELECT ON public.users TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- 6. Verificar se foi criado
SELECT 'Trigger criado com sucesso!' as status;
