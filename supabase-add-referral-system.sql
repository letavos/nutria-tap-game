-- Adicionar sistema de referência ao banco de dados

-- Adicionar coluna referral_id na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_id VARCHAR(8) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by VARCHAR(8);

-- Adicionar coluna referrals na tabela game_stats (como JSON)
ALTER TABLE game_stats ADD COLUMN IF NOT EXISTS referrals JSONB DEFAULT '[]'::jsonb;

-- Adicionar coluna max_streak na tabela game_stats se não existir
ALTER TABLE game_stats ADD COLUMN IF NOT EXISTS max_streak INTEGER DEFAULT 0;

-- Atualizar a view de ranking para incluir referrals
DROP VIEW IF EXISTS ranking_view;
DROP MATERIALIZED VIEW IF EXISTS ranking_view;

CREATE MATERIALIZED VIEW ranking_view AS
SELECT 
  u.id,
  u.username,
  u.wallet_address,
  u.referral_id,
  gs.total_coins,
  gs.level,
  gs.total_clicks,
  gs.streak,
  gs.max_streak,
  gs.prestige_level,
  COALESCE(jsonb_array_length(gs.referrals), 0) as total_referrals,
  ROW_NUMBER() OVER (ORDER BY gs.total_coins DESC) as rank,
  gs.last_sync
FROM users u
JOIN game_stats gs ON u.id = gs.user_id
WHERE gs.total_coins > 0
ORDER BY gs.total_coins DESC;

-- Função para gerar referral_id único
CREATE OR REPLACE FUNCTION generate_referral_id()
RETURNS VARCHAR(8) AS $$
DECLARE
    new_id VARCHAR(8);
    exists_count INTEGER;
BEGIN
    LOOP
        -- Gera um ID de 8 caracteres alfanuméricos
        new_id := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        
        -- Verifica se já existe
        SELECT COUNT(*) INTO exists_count FROM users WHERE referral_id = new_id;
        
        -- Se não existe, sai do loop
        IF exists_count = 0 THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar referral_id automaticamente quando um usuário é criado
CREATE OR REPLACE FUNCTION set_referral_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_id IS NULL OR NEW.referral_id = '' THEN
        NEW.referral_id := generate_referral_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela users
DROP TRIGGER IF EXISTS trigger_set_referral_id ON users;
CREATE TRIGGER trigger_set_referral_id
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_referral_id();

-- Atualizar usuários existentes que não têm referral_id
UPDATE users 
SET referral_id = generate_referral_id() 
WHERE referral_id IS NULL OR referral_id = '';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_referral_id ON users(referral_id);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_game_stats_referrals ON game_stats USING GIN (referrals);

-- Função para adicionar referido
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
$$ LANGUAGE plpgsql;

-- Refresh da view de ranking
REFRESH MATERIALIZED VIEW ranking_view;
