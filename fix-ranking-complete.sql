-- ========================================
-- 🔧 CORREÇÃO COMPLETA DO RANKING
-- ========================================

-- 1. 🗑️ REMOVER RPC ANTIGA (se existir)
DROP FUNCTION IF EXISTS public.get_ranking(integer);

-- 2. 🆕 CRIAR RPC CORRIGIDA COM TIPO TABLE
CREATE OR REPLACE FUNCTION public.get_ranking(p_limit integer DEFAULT 100)
RETURNS TABLE(
    user_id uuid,
    username varchar,
    email varchar,
    created_at timestamptz,
    total_coins numeric,
    total_clicks integer,
    level integer,
    prestige_level integer,
    streak integer,
    overall_score numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    gs.user_id,
    u.username,
    u.email,
    u.created_at,
    gs.total_coins::numeric,
    gs.total_clicks,
    gs.level,
    gs.prestige_level,
    COALESCE(gs.max_streak, gs.streak) as streak,
    (
      COALESCE(gs.total_coins,0)
      + (COALESCE(gs.level,0) * 1000)
      + (COALESCE(gs.total_clicks,0) * 2)
      + (COALESCE(gs.max_streak, gs.streak, 0) * 500)
      + (COALESCE(gs.prestige_level,0) * 5000)
    )::numeric as overall_score
  FROM public.game_stats gs
  JOIN public.users u ON u.id = gs.user_id
  ORDER BY overall_score DESC
  LIMIT COALESCE(p_limit, 100);
$$;

-- 3. 🔐 CONCEDER PERMISSÕES CORRETAS
GRANT EXECUTE ON FUNCTION public.get_ranking(integer) TO anon;
GRANT EXECUTE ON FUNCTION public.get_ranking(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ranking(integer) TO service_role;

-- 4. 🧹 LIMPAR POLÍTICAS RLS DUPLICADAS
-- Remover políticas duplicadas do game_stats
DROP POLICY IF EXISTS "Enable all operations for game_stats" ON public.game_stats;
DROP POLICY IF EXISTS "Users can view all stats" ON public.game_stats;
DROP POLICY IF EXISTS "Users can view own game stats" ON public.game_stats;
DROP POLICY IF EXISTS "game_stats_select_own" ON public.game_stats;

-- Manter apenas as políticas essenciais
-- (As políticas restantes já estão corretas)

-- 5. 🧹 LIMPAR POLÍTICAS RLS DUPLICADAS DO user_upgrades
DROP POLICY IF EXISTS "User upgrades are viewable by everyone" ON public.user_upgrades;
DROP POLICY IF EXISTS "Users can view all upgrades" ON public.user_upgrades;
DROP POLICY IF EXISTS "Users can view own upgrades" ON public.user_upgrades;
DROP POLICY IF EXISTS "user_upgrades_select_own" ON public.user_upgrades;

-- Manter apenas as políticas essenciais
-- (As políticas restantes já estão corretas)

-- 6. 🧹 LIMPAR POLÍTICAS RLS DUPLICADAS DO users
DROP POLICY IF EXISTS "Enable all operations for users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- Manter apenas as políticas essenciais
-- (As políticas restantes já estão corretas)

-- 7. 🔍 VERIFICAR SE A CORREÇÃO FUNCIONOU
SELECT 'Testando RPC corrigida...' as status;

-- Testar a RPC
SELECT * FROM public.get_ranking(5);

-- 8. 📊 VERIFICAR ESTRUTURA DA RPC
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_ranking';

-- 9. ✅ CONFIRMAÇÃO FINAL
SELECT 'Ranking corrigido com sucesso! 🎉' as resultado;
