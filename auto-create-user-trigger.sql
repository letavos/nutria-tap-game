-- Trigger para criar automaticamente usuários na tabela public.users
-- Execute este script no Supabase SQL Editor

-- 1. Criar função que será chamada pelo trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir na tabela public.users
  INSERT INTO public.users (id, username, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username', 
      SPLIT_PART(NEW.email, '@', 1), 
      'user_' || SUBSTRING(NEW.id::text, 1, 8)
    ),
    NEW.email,
    NEW.created_at,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Inserir na tabela public.game_stats
  INSERT INTO public.game_stats (user_id, total_coins, total_clicks, level, experience, prestige_level, streak, max_streak, referrals, last_click, last_sync, created_at, updated_at)
  VALUES (
    NEW.id,
    0, 0, 1, 0, 0, 0, 0,
    '[]'::jsonb,
    NOW(), NOW(), NOW(), NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar trigger que executa a função quando um novo usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Verificar se o trigger foi criado
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
