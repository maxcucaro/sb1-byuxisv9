-- Drop existing function if exists
DROP FUNCTION IF EXISTS get_giacenza_effettiva;

-- Recreate function with fixes
CREATE OR REPLACE FUNCTION get_giacenza_effettiva(
    _settore TEXT,
    _articolo_cod TEXT
) RETURNS TABLE (
    quantita_totale INTEGER,
    quantita_in_kit INTEGER,
    quantita_impegnata INTEGER,
    quantita_in_uscita INTEGER,
    quantita_disponibile INTEGER,
    dettaglio_kit JSON
) AS $$
DECLARE
    _quantita_totale INTEGER;
    _quantita_in_kit INTEGER;
    _quantita_impegnata INTEGER;
    _quantita_in_uscita INTEGER;
BEGIN
    -- Get total quantity from the appropriate table
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
    SELECT COALESCE(SUM(mr.quantita), 0)
    INTO _quantita_impegnata
    FROM materiali_richiesti mr
    JOIN schede_lavoro sl ON mr.scheda_id = sl.id
    WHERE mr.settore = _settore 
    AND mr.articolo_cod = _articolo_cod
    AND mr.stato = 'IMPEGNATO'
    AND sl.stato NOT IN ('BOZZA', 'ANNULLATA');

    -- Calculate quantity in transit
    SELECT COALESCE(SUM(mr.quantita), 0)
    INTO _quantita_in_uscita
    FROM materiali_richiesti mr
    JOIN schede_lavoro sl ON mr.scheda_id = sl.id
    WHERE mr.settore = _settore 
    AND mr.articolo_cod = _articolo_cod
    AND mr.stato = 'OUT'
    AND sl.stato NOT IN ('BOZZA', 'ANNULLATA');

    RETURN QUERY
    SELECT 
        COALESCE(_quantita_totale, 0),
        COALESCE(_quantita_in_kit, 0),
        COALESCE(_quantita_impegnata, 0),
        COALESCE(_quantita_in_uscita, 0),
        COALESCE(_quantita_totale - _quantita_in_kit - _quantita_impegnata - _quantita_in_uscita, 0),
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_giacenza_effettiva TO PUBLIC;