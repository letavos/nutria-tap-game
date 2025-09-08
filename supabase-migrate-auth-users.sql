-- Migrar usuários do sistema de auth para a tabela users
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuários existentes na tabela users
SELECT 
    id,
    username,
    email,
    created_at
FROM users
ORDER BY created_at DESC;

-- 2. Verificar se há usuários no sistema de auth que não estão na tabela users
-- NOTA: Esta query não funcionará diretamente, mas mostra o que precisamos fazer
-- SELECT 
--     au.id,
--     au.email,
--     au.raw_user_meta_data->>'username' as username,
--     au.created_at
-- FROM auth.users au
-- LEFT JOIN users u ON au.id = u.id
-- WHERE u.id IS NULL;

-- 3. Inserir usuários do sistema de auth na tabela users
-- ATENÇÃO: Execute apenas se os usuários não existirem na tabela users
-- Substitua os valores pelos dados reais dos usuários

-- Exemplo para o usuário TKNutria:
INSERT INTO users (id, username, email, created_at, updated_at)
VALUES (
    '7f6402d6-cc89-409d-b222-983595713058',
    'TKNutria',
    'tknutria@gmail.com',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Exemplo para o usuário D21m0110:
INSERT INTO users (id, username, email, created_at, updated_at)
VALUES (
    'd986b242-ab46-4d1e-a15b-3916fe750537',
    'D21m0110',
    'letavos@colegioequacao.com',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Exemplo para o usuário Nutria:
INSERT INTO users (id, username, email, created_at, updated_at)
VALUES (
    '1038dbc5-b642-4c3b-b8a5-3b3d590ed3b1',
    'Nutria',
    'letavos2@gmail.com',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 4. Verificar se os usuários foram inseridos
SELECT 
    id,
    username,
    email,
    created_at
FROM users
WHERE id IN (
    '7f6402d6-cc89-409d-b222-983595713058',
    'd986b242-ab46-4d1e-a15b-3916fe750537',
    '1038dbc5-b642-4c3b-b8a5-3b3d590ed3b1'
)
ORDER BY created_at DESC;

-- 5. Criar game_stats para os usuários se não existirem
INSERT INTO game_stats (user_id, total_coins, total_clicks, level, experience, prestige_level, streak, max_streak, last_click, last_sync, created_at, updated_at)
SELECT 
    u.id,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    NOW(),
    NOW(),
    NOW(),
    NOW()
FROM users u
LEFT JOIN game_stats gs ON u.id = gs.user_id
WHERE gs.user_id IS NULL
AND u.id IN (
    '7f6402d6-cc89-409d-b222-983595713058',
    'd986b242-ab46-4d1e-a15b-3916fe750537',
    '1038dbc5-b642-4c3b-b8a5-3b3d590ed3b1'
);

-- 6. Verificar se game_stats foram criados
SELECT 
    gs.user_id,
    u.username,
    u.email,
    gs.total_coins,
    gs.level,
    gs.created_at
FROM game_stats gs
JOIN users u ON gs.user_id = u.id
WHERE gs.user_id IN (
    '7f6402d6-cc89-409d-b222-983595713058',
    'd986b242-ab46-4d1e-a15b-3916fe750537',
    '1038dbc5-b642-4c3b-b8a5-3b3d590ed3b1'
)
ORDER BY gs.created_at DESC;
