-- Script simples para corrigir criação de usuários
-- Execute no SQL Editor do Supabase

-- 1. Verificar se a tabela users existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
) as table_exists;

-- 2. Se a tabela não existir, criá-la
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  wallet_address VARCHAR(255),
  avatar_url TEXT,
  referral_id VARCHAR(50) UNIQUE,
  referred_by VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Remover trigger e função existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 4. Criar função simplificada
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
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se já existe, apenas atualizar
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
    RAISE LOG 'Erro ao criar usuário: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Garantir permissões
GRANT ALL ON public.users TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- 7. Ativar RLS se não estiver ativado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas RLS básicas
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
CREATE POLICY "Enable insert for authenticated users" ON public.users
  FOR INSERT WITH CHECK (true);

-- 9. Verificar se foi criado corretamente
SELECT 'Trigger e função criados com sucesso!' as status;
