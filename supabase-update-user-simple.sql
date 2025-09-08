-- Script simplificado para atualizar dados do usuário

-- Atualizar dados do usuário atual com valores de exemplo
UPDATE public.game_stats 
SET 
  total_coins = 275,
  total_clicks = 120,
  level = 2,
  experience = 50,
  prestige_level = 0,
  streak = 5,
  max_streak = 8,
  total_achievements = 3,
  last_click = NOW(),
  last_sync = NOW()
WHERE user_id = '1038dbc5-b642-4c3b-b8a5-3b3d590ed3b1';

-- Verificar se os dados foram atualizados
SELECT 
  user_id,
  total_coins,
  total_clicks,
  level,
  experience,
  prestige_level,
  streak,
  max_streak,
  total_achievements,
  last_click
FROM public.game_stats 
WHERE user_id = '1038dbc5-b642-4c3b-b8a5-3b3d590ed3b1';

-- Verificar o ranking atualizado
SELECT * FROM public.ranking_view LIMIT 5;
