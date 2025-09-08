-- Script para recriar tabela users com estrutura correta
-- Execute no SQL Editor do Supabase

-- 1. Fazer backup dos dados existentes (se houver)
CREATE TABLE IF NOT EXISTS public.users_backup AS 
SELECT * FROM public.users;

-- 2. Remover trigger e função existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Remover tabela users existente
DROP TABLE IF EXISTS public.users CASCADE;

-- 4. Criar tabela users com estrutura correta
CREATE TABLE public.users (
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

-- 5. Criar índices para performance
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_referral_id ON public.users(referral_id);
CREATE INDEX idx_users_referred_by ON public.users(referred_by);

-- 6. Ativar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas RLS
-- Política para usuários verem apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Política para usuários atualizarem apenas seus próprios dados
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Política para inserção (será feita pelo trigger)
CREATE POLICY "Enable insert for authenticated users" ON public.users
  FOR INSERT WITH CHECK (true);

-- 8. Criar função para gerar referral_id único
CREATE OR REPLACE FUNCTION generate_referral_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    new_id := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM public.users WHERE referral_id = new_id) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Criar função para criar usuário
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
    generate_referral_id(),
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erro ao criar usuário: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Garantir permissões
GRANT ALL ON public.users TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- 12. Verificar se foi criado corretamente
SELECT 'Tabela users recriada com sucesso!' as status;
