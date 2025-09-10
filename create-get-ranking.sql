-- Função RPC para obter ranking, contornando RLS das tabelas base
-- Execute no SQL Editor do Supabase

create or replace function public.get_ranking(p_limit integer default 100)
returns table (
  user_id uuid,
  username text,
  email text,
  created_at timestamptz,
  total_coins numeric,
  total_clicks bigint,
  level integer,
  prestige_level integer,
  streak integer,
  overall_score numeric
) language sql
security definer
set search_path = public
as $$
  select gs.user_id,
         u.username,
         u.email,
         u.created_at,
         gs.total_coins::numeric,
         gs.total_clicks,
         gs.level,
         gs.prestige_level,
         coalesce(gs.max_streak, gs.streak) as streak,
         (
           coalesce(gs.total_coins,0)
           + (coalesce(gs.level,0) * 1000)
           + (coalesce(gs.total_clicks,0) * 2)
           + (coalesce(gs.max_streak, gs.streak, 0) * 500)
           + (coalesce(gs.prestige_level,0) * 5000)
         )::numeric as overall_score
  from public.game_stats gs
  join public.users u on u.id = gs.user_id
  order by overall_score desc
  limit coalesce(p_limit, 100);
$$;

revoke all on function public.get_ranking(integer) from public;
grant execute on function public.get_ranking(integer) to anon, authenticated;


