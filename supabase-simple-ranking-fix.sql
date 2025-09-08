-- Script simples para corrigir ranking

-- 1. Remover materialized view existente
DROP MATERIALIZED VIEW IF EXISTS public.ranking_view;

-- 2. Criar view simples (não materialized)
CREATE VIEW public.ranking_view AS
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

-- 3. Configurar permissões
GRANT SELECT ON public.ranking_view TO anon;
GRANT SELECT ON public.ranking_view TO authenticated;

-- 4. Testar a view
SELECT * FROM public.ranking_view LIMIT 3;
