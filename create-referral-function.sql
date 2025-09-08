-- Script para criar função add_referral no Supabase
-- Execute no SQL Editor do Supabase

-- 1. Verificar se a função já existe
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_name = 'add_referral'
AND routine_schema = 'public';

-- 2. Criar função add_referral se não existir
CREATE OR REPLACE FUNCTION add_referral(user_uuid UUID, referral_code VARCHAR(8))
RETURNS BOOLEAN AS $$
DECLARE
    referrer_id UUID;
    current_referrals JSONB;
BEGIN
    -- Verifica se o código de referência existe
    SELECT id INTO referrer_id FROM users WHERE referral_id = referral_code;
    
    IF referrer_id IS NULL THEN
        RETURN FALSE; -- Código não encontrado
    END IF;
    
    IF referrer_id = user_uuid THEN
        RETURN FALSE; -- Não pode se referenciar
    END IF;
    
    -- Verifica se já foi referenciado por este usuário
    SELECT referrals INTO current_referrals FROM game_stats WHERE user_id = referrer_id;
    
    IF current_referrals ? user_uuid::text THEN
        RETURN FALSE; -- Já foi referenciado
    END IF;
    
    -- Adiciona o referido
    UPDATE game_stats 
    SET referrals = COALESCE(referrals, '[]'::jsonb) || to_jsonb(user_uuid::text)
    WHERE user_id = referrer_id;
    
    -- Marca quem referenciou
    UPDATE users 
    SET referred_by = referral_code 
    WHERE id = user_uuid;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Garantir permissões
GRANT EXECUTE ON FUNCTION add_referral(UUID, VARCHAR(8)) TO service_role;
GRANT EXECUTE ON FUNCTION add_referral(UUID, VARCHAR(8)) TO authenticated;

-- 4. Verificar se foi criada
SELECT 'Função add_referral criada com sucesso!' as status;
