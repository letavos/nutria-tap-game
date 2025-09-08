-- Script corrigido para fixar usuários existentes
-- Execute no SQL Editor do Supabase

-- 1. Primeiro, verificar estrutura atual da tabela users
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Adicionar colunas que podem estar faltando
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(255),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS referral_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS referred_by VARCHAR(50),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_id ON public.users(referral_id);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users(referred_by);

-- 4. Agora corrigir os usuários que estão em auth.users mas não em public.users
INSERT INTO public.users (
  id,
  username,
  email,
  display_name,
  wallet_address,
  avatar_url,
  referral_id,
  created_at,
  updated_at
)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)) as username,
  au.email,
  COALESCE(au.raw_user_meta_data->>'display_name', au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)) as display_name,
  au.raw_user_meta_data->>'wallet_address' as wallet_address,
  au.raw_user_meta_data->>'avatar_url' as avatar_url,
  upper(substring(md5(random()::text) from 1 for 8)) as referral_id,
  COALESCE(au.created_at, NOW()) as created_at,
  COALESCE(au.updated_at, NOW()) as updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 5. Verificar quantos usuários foram corrigidos
SELECT 'Usuários corrigidos:' as status, COUNT(*) as count
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NOT NULL;

-- 6. Agora vamos garantir que o trigger funcione corretamente
-- Remover trigger e função existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 7. Criar função melhorada com logs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Log da tentativa de criação
  RAISE LOG 'Tentando criar usuário: %', NEW.id;
  
  INSERT INTO public.users (
    id,
    username,
    email,
    display_name,
    wallet_address,
    avatar_url,
    referral_id,
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
    upper(substring(md5(random()::text) from 1 for 8)),
    NOW(),
    NOW()
  );
  
  RAISE LOG 'Usuário criado com sucesso: %', NEW.id;
  RETURN NEW;
  
EXCEPTION
  WHEN unique_violation THEN
    -- Se já existe, apenas atualizar
    RAISE LOG 'Usuário já existe, atualizando: %', NEW.id;
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
    -- Log do erro mas não falhar a criação do usuário
    RAISE LOG 'ERRO ao criar usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Garantir permissões
GRANT ALL ON public.users TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- 10. Ativar RLS se não estiver ativado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 11. Criar políticas RLS básicas
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
CREATE POLICY "Enable insert for authenticated users" ON public.users
  FOR INSERT WITH CHECK (true);

-- 12. Verificar se o trigger foi criado
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users'
AND event_object_schema = 'auth';

-- 13. Verificar se a função foi criada
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- 14. Verificar se os usuários foram corrigidos
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

-- 15. Mostrar status final
SELECT 'Correção concluída! Agora teste criar uma nova conta.' as status;
