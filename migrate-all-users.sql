-- Script para migrar TODOS os usuários do auth.users para public.users
-- Execute este script UMA VEZ no Supabase SQL Editor

-- 1. Migrar todos os usuários do auth.users para public.users
INSERT INTO public.users (id, username, email, created_at, updated_at)
SELECT 
    au.id,
    COALESCE(
        au.raw_user_meta_data->>'username', 
        SPLIT_PART(au.email, '@', 1), 
        'user_' || SUBSTRING(au.id::text, 1, 8)
    ) as username,
    au.email,
    au.created_at,
    NOW() as updated_at
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- 2. Criar game_stats para todos os usuários que não têm
INSERT INTO public.game_stats (user_id, total_coins, total_clicks, level, experience, prestige_level, streak, max_streak, referrals, last_click, last_sync, created_at, updated_at)
SELECT 
    u.id,
    0 as total_coins,
    0 as total_clicks,
    1 as level,
    0 as experience,
    0 as prestige_level,
    0 as streak,
    0 as max_streak,
    '[]'::jsonb as referrals,
    NOW() as last_click,
    NOW() as last_sync,
    NOW() as created_at,
    NOW() as updated_at
FROM public.users u
WHERE u.id NOT IN (SELECT user_id FROM public.game_stats)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Verificar resultado
SELECT 
    'Usuários migrados' as status,
    COUNT(*) as total
FROM public.users;

SELECT 
    'Game stats criados' as status,
    COUNT(*) as total
FROM public.game_stats;
