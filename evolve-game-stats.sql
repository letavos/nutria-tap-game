-- Evolução de schema para persistir estado completo do jogo no Supabase
-- Execute este script no SQL Editor do Supabase (projeto: nutria-tap)

-- 1) Adicionar colunas JSONB e numéricas caso não existam
alter table if exists public.game_stats
  add column if not exists achievements jsonb default '[]'::jsonb,
  add column if not exists referrals jsonb default '[]'::jsonb,
  add column if not exists rewards jsonb default '{}'::jsonb,
  add column if not exists missions jsonb default '{}'::jsonb,
  add column if not exists customization jsonb default '{}'::jsonb,
  add column if not exists upgrades jsonb default '{}'::jsonb,
  add column if not exists days_active jsonb default '[]'::jsonb,
  add column if not exists airdrop_points bigint default 0;

-- 2) Garantir tipos coerentes
alter table if exists public.game_stats
  alter column achievements set default '[]'::jsonb,
  alter column referrals set default '[]'::jsonb,
  alter column rewards set default '{}'::jsonb,
  alter column missions set default '{}'::jsonb,
  alter column customization set default '{}'::jsonb,
  alter column upgrades set default '{}'::jsonb,
  alter column days_active set default '[]'::jsonb,
  alter column airdrop_points set default 0;

-- 3) Índices opcionais (melhoram consultas em JSONB)
create index if not exists game_stats_achievements_gin on public.game_stats using gin ((achievements));
create index if not exists game_stats_days_active_gin on public.game_stats using gin ((days_active));
create index if not exists game_stats_upgrades_gin on public.game_stats using gin ((upgrades));

-- 6) Garantir unicidade por usuário (necessário para upsert por RPC)
create unique index if not exists game_stats_user_unique on public.game_stats (user_id);

-- 7) RPC para salvar upgrades/coins/prestígio de forma atômica
create or replace function public.save_upgrades(
  p_coins numeric,
  p_upgrades jsonb,
  p_prestige_level int
)
returns void
language sql
security definer
as $$
  insert into public.game_stats (user_id, total_coins, upgrades, prestige_level, last_sync)
  values (auth.uid(), p_coins, p_upgrades, p_prestige_level, now())
  on conflict (user_id) do update set
    total_coins = excluded.total_coins,
    upgrades = excluded.upgrades,
    prestige_level = greatest(public.game_stats.prestige_level, excluded.prestige_level),
    last_sync = now();
$$;

grant execute on function public.save_upgrades(numeric, jsonb, int) to anon, authenticated;

-- 4) Políticas RLS (assumindo RLS já ativado na tabela)
-- O usuário só pode ver/alterar sua própria linha
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'game_stats' and policyname = 'game_stats_select_own'
  ) then
    create policy game_stats_select_own on public.game_stats
      for select using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'game_stats' and policyname = 'game_stats_insert_own'
  ) then
    create policy game_stats_insert_own on public.game_stats
      for insert with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'game_stats' and policyname = 'game_stats_update_own'
  ) then
    create policy game_stats_update_own on public.game_stats
      for update using (user_id = auth.uid());
  end if;
end $$;

-- 5) Comentários (documentação)
comment on column public.game_stats.achievements is 'Lista de conquistas desbloqueadas (array de strings)';
comment on column public.game_stats.referrals is 'Lista de user_id referidos (array) ou códigos';
comment on column public.game_stats.rewards is 'Estado das recompensas (daily/weekly/monthly/login)';
comment on column public.game_stats.missions is 'Progresso de missões (daily/weekly)';
comment on column public.game_stats.customization is 'Preferências visuais do usuário';
comment on column public.game_stats.upgrades is 'Estado de melhorias (clickUpgrade, autoClicker, multiplier, prestige etc.)';
comment on column public.game_stats.days_active is 'Dias em que o usuário jogou';
comment on column public.game_stats.airdrop_points is 'Pontuação agregada de airdrop';


