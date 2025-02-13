-- Drop existing duplicated objects
DROP TABLE IF EXISTS inventario_completo CASCADE;
DROP VIEW IF EXISTS inventario_completo CASCADE;
DROP FUNCTION IF EXISTS populate_inventario_completo() CASCADE;
DROP FUNCTION IF EXISTS update_inventario_completo() CASCADE;

-- Create unified inventory view
CREATE OR REPLACE VIEW inventario_completo AS
SELECT 
    cod,
    descrizione,
    settore,
    categoria,
    quantita,
    base,
    altezza,
    profondita,
    peso,
    ubicazione,
    attivo,
    COALESCE(
        (SELECT SUM(kc.quantita * ka.quantita_kit)
         FROM kit_componenti kc
         JOIN kit_articoli ka ON kc.kit_id = ka.id
         WHERE kc.componente_settore = settore 
         AND kc.componente_cod = cod
         AND ka.attivo = true),
        0
    ) as quantita_in_kit,
    quantita - COALESCE(
        (SELECT SUM(kc.quantita * ka.quantita_kit)
         FROM kit_componenti kc
         JOIN kit_articoli ka ON kc.kit_id = ka.id
         WHERE kc.componente_settore = settore 
         AND kc.componente_cod = cod
         AND ka.attivo = true),
        0
    ) as quantita_disponibile
FROM (
    -- AUDIO
    SELECT cod, descrizione, 'AUDIO' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_audio
    UNION ALL
    -- LUCI
    SELECT cod, descrizione, 'LUCI' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_luci
    UNION ALL
    -- VIDEO
    SELECT cod, descrizione, 'VIDEO' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_video
    UNION ALL
    -- ELETTRICO
    SELECT cod, descrizione, 'ELETTRICO' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_elettrico
    UNION ALL
    -- SEGNALI
    SELECT cod, descrizione, 'SEGNALI' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_segnali
    UNION ALL
    -- STRUTTURE
    SELECT cod, descrizione, 'STRUTTURE' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_strutture
    UNION ALL
    -- ALLESTIMENTO
    SELECT cod, descrizione, 'ALLESTIMENTO' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_allestimento
    UNION ALL
    -- ATTREZZATURE
    SELECT cod, descrizione, 'ATTREZZATURE' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_attrezzature
    UNION ALL
    -- BACKLINE
    SELECT cod, descrizione, 'BACKLINE' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_backline
    UNION ALL
    -- RIGGHERAGGIO
    SELECT cod, descrizione, 'RIGGHERAGGIO' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_riggheraggio
    UNION ALL
    -- GENERICO
    SELECT cod, descrizione, 'GENERICO' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_generico
    UNION ALL
    -- IMBALLI
    SELECT codice as cod, descrizione, 'IMBALLI' as settore, 'IMBALLI' as categoria, 1 as quantita, 
           NULL as base, NULL as altezza, NULL as profondita, peso, NULL as ubicazione, attivo
    FROM imballi
) AS all_items;

-- Create table for tracking inventory movements
CREATE TABLE IF NOT EXISTS inventario_movimenti (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    settore TEXT NOT NULL,
    articolo_cod TEXT NOT NULL,
    tipo_movimento TEXT NOT NULL CHECK (tipo_movimento IN ('IN', 'OUT')),
    quantita INTEGER NOT NULL CHECK (quantita > 0),
    scheda_id uuid REFERENCES schede_lavoro(id),
    operatore_id uuid REFERENCES team(id),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Function to get effective stock level
CREATE OR REPLACE FUNCTION get_giacenza_effettiva(
    _settore TEXT,
    _articolo_cod TEXT
) RETURNS TABLE (
    quantita_totale INTEGER,
    quantita_in_kit INTEGER,
    quantita_disponibile INTEGER,
    quantita_impegnata INTEGER,
    quantita_in_uscita INTEGER,
    dettaglio_kit JSON
) AS $$
DECLARE
    _quantita_totale INTEGER;
    _quantita_in_kit INTEGER;
    _quantita_impegnata INTEGER;
    _quantita_in_uscita INTEGER;
BEGIN
    -- Get total quantity
    EXECUTE format(
        'SELECT quantita FROM articoli_%I WHERE cod = $1',
        lower(_settore)
    ) INTO _quantita_totale USING _articolo_cod;

    -- Calculate kit usage
    SELECT COALESCE(SUM(kc.quantita * ka.quantita_kit), 0)
    INTO _quantita_in_kit
    FROM kit_componenti kc
    JOIN kit_articoli ka ON kc.kit_id = ka.id
    WHERE kc.componente_settore = _settore 
    AND kc.componente_cod = _articolo_cod
    AND ka.attivo = true;

    -- Calculate committed quantity
    SELECT COALESCE(SUM(quantita), 0)
    INTO _quantita_impegnata
    FROM materiali_richiesti
    WHERE settore = _settore 
    AND articolo_cod = _articolo_cod
    AND stato = 'IMPEGNATO';

    -- Calculate quantity in transit
    SELECT COALESCE(SUM(quantita), 0)
    INTO _quantita_in_uscita
    FROM materiali_richiesti
    WHERE settore = _settore 
    AND articolo_cod = _articolo_cod
    AND stato = 'OUT';

    -- Get kit details
    RETURN QUERY
    SELECT 
        COALESCE(_quantita_totale, 0),
        _quantita_in_kit,
        (COALESCE(_quantita_totale, 0) - _quantita_in_kit - _quantita_impegnata - _quantita_in_uscita),
        _quantita_impegnata,
        _quantita_in_uscita,
        COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'kit_nome', ka.nome,
                    'kit_settore', ka.settore,
                    'kit_cod', ka.articolo_cod,
                    'quantita_kit', ka.quantita_kit,
                    'quantita_componente', kc.quantita,
                    'totale_impegnato', (ka.quantita_kit * kc.quantita)
                )
            )
            FROM kit_componenti kc
            JOIN kit_articoli ka ON kc.kit_id = ka.id
            WHERE kc.componente_settore = _settore 
            AND kc.componente_cod = _articolo_cod
            AND ka.attivo = true),
            '[]'::json
        );
END;
$$ LANGUAGE plpgsql;

-- Function to track inventory movement
CREATE OR REPLACE FUNCTION track_movimento(
    _settore TEXT,
    _articolo_cod TEXT,
    _tipo_movimento TEXT,
    _quantita INTEGER,
    _scheda_id UUID,
    _operatore_id UUID,
    _note TEXT DEFAULT NULL
) RETURNS inventario_movimenti AS $$
DECLARE
    _movimento inventario_movimenti;
BEGIN
    -- Insert movement record
    INSERT INTO inventario_movimenti (
        settore,
        articolo_cod,
        tipo_movimento,
        quantita,
        scheda_id,
        operatore_id,
        note
    ) VALUES (
        _settore,
        _articolo_cod,
        _tipo_movimento,
        _quantita,
        _scheda_id,
        _operatore_id,
        _note
    ) RETURNING * INTO _movimento;

    -- Update article quantity
    EXECUTE format(
        'UPDATE articoli_%I SET quantita = quantita %s $1 WHERE cod = $2',
        lower(_settore),
        CASE WHEN _tipo_movimento = 'IN' THEN '+' ELSE '-' END
    ) USING _quantita, _articolo_cod;

    RETURN _movimento;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE inventario_movimenti ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Accesso pubblico in lettura movimenti"
    ON inventario_movimenti
    FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Accesso pubblico in scrittura movimenti"
    ON inventario_movimenti
    FOR INSERT
    TO PUBLIC
    WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_movimenti_articolo 
ON inventario_movimenti(settore, articolo_cod);

CREATE INDEX IF NOT EXISTS idx_movimenti_scheda 
ON inventario_movimenti(scheda_id);

CREATE INDEX IF NOT EXISTS idx_movimenti_data 
ON inventario_movimenti(created_at);

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_giacenza_effettiva TO PUBLIC;
GRANT EXECUTE ON FUNCTION track_movimento TO PUBLIC;