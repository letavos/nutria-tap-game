-- SOLUÇÃO SIMPLES E DIRETA
-- Execute no SQL Editor do Supabase

-- 1. Primeiro, vamos ver o que temos
SELECT 'Estrutura atual da tabela users:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ver quantos usuários temos em cada tabela
SELECT 'Contagem de usuários:' as info;
SELECT 'auth.users' as tabela, COUNT(*) as total FROM auth.users
UNION ALL
SELECT 'public.users' as tabela, COUNT(*) as total FROM public.users;

-- 3. Ver quais usuários estão órfãos
SELECT 'Usuários órfãos:' as info;
SELECT au.id, au.email, au.raw_user_meta_data->>'username' as username
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 4. Adicionar apenas as colunas essenciais que estão faltando
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(255),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS referral_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS referred_by VARCHAR(50),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Inserir usuários órfãos com username único
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
WHERE pu.id IS NULL
ON CONFLICT (username) DO UPDATE SET
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  wallet_address = EXCLUDED.wallet_address,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = NOW();

-- 6. Criar função simples para novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
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
  )
  ON CONFLICT (username) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    wallet_address = EXCLUDED.wallet_address,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, apenas continuar
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Criar trigger simples
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Verificar resultado final
SELECT 'Resultado final:' as info;
SELECT 'Usuários em auth.users sem entrada em public.users' as issue, COUNT(*) as count
FROM auth.users au LEFT JOIN public.users pu ON au.id = pu.id WHERE pu.id IS NULL
UNION ALL
SELECT 'Usuários em public.users sem entrada em auth.users' as issue, COUNT(*) as count
FROM public.users pu LEFT JOIN auth.users au ON pu.id = au.id WHERE au.id IS NULL;

SELECT 'Pronto! Agora teste criar uma conta.' as status;
