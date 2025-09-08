-- Script para verificar e corrigir a view ranking_view

-- 1. Verificar se a view existe
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'ranking_view';

-- 2. Verificar estrutura da view
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ranking_view' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Recriar a materialized view com estrutura correta
DROP MATERIALIZED VIEW IF EXISTS public.ranking_view;

CREATE MATERIALIZED VIEW public.ranking_view AS
SELECT
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  gs.user_id,
  gs.total_coins,
  gs.level,
  gs.total_clicks,
  gs.prestige_level,
  gs.streak,
  gs.max_streak,
  gs.total_achievements,
  gs.experience,
  gs.last_click,
  gs.last_sync,
  ROW_NUMBER() OVER (ORDER BY gs.total_coins DESC, gs.level DESC, gs.total_clicks DESC) as rank
FROM
  public.profiles p
JOIN
  public.game_stats gs ON p.id = gs.user_id
ORDER BY gs.total_coins DESC, gs.level DESC, gs.total_clicks DESC;

-- 4. Verificar se a view foi criada corretamente
SELECT * FROM public.ranking_view LIMIT 5;

-- 5. Verificar permissões
GRANT SELECT ON public.ranking_view TO anon;
GRANT SELECT ON public.ranking_view TO authenticated;

-- 6. Atualizar a materialized view
REFRESH MATERIALIZED VIEW public.ranking_view;

-- 7. Verificar se foi criada corretamente
SELECT * FROM public.ranking_view LIMIT 5;
