-- Drop existing function
DROP FUNCTION IF EXISTS get_giacenza_effettiva;

-- Recreate function with improved kit details handling
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
    _table_name TEXT;
BEGIN
    -- Normalize table name
    _table_name := 'articoli_' || lower(_settore);

    -- Get total quantity with error handling
    BEGIN
        EXECUTE format(
            'SELECT COALESCE(quantita, 0) FROM %I WHERE cod = $1',
            _table_name
        ) INTO _quantita_totale USING _articolo_cod;
    EXCEPTION WHEN OTHERS THEN
        RAISE DEBUG 'Error getting quantity from %: %', _table_name, SQLERRM;
        _quantita_totale := 0;
    END;

    -- Calculate kit usage with error handling
    BEGIN
        SELECT COALESCE(SUM(kc.quantita * ka.quantita_kit), 0)
        INTO _quantita_in_kit
        FROM kit_componenti kc
        JOIN kit_articoli ka ON kc.kit_id = ka.id
        WHERE kc.componente_settore = _settore 
        AND kc.componente_cod = _articolo_cod
        AND ka.attivo = true;
    EXCEPTION WHEN OTHERS THEN
        RAISE DEBUG 'Error calculating kit usage: %', SQLERRM;
        _quantita_in_kit := 0;
    END;

    -- Calculate committed quantity with error handling
    BEGIN
        SELECT COALESCE(SUM(mr.quantita), 0)
        INTO _quantita_impegnata
        FROM materiali_richiesti mr
        JOIN schede_lavoro sl ON mr.scheda_id = sl.id
        WHERE mr.settore = _settore 
        AND mr.articolo_cod = _articolo_cod
        AND mr.stato = 'IMPEGNATO'
        AND sl.stato NOT IN ('BOZZA', 'ANNULLATA');
    EXCEPTION WHEN OTHERS THEN
        RAISE DEBUG 'Error calculating committed quantity: %', SQLERRM;
        _quantita_impegnata := 0;
    END;

    -- Calculate quantity in transit with error handling
    BEGIN
        SELECT COALESCE(SUM(mr.quantita), 0)
        INTO _quantita_in_uscita
        FROM materiali_richiesti mr
        JOIN schede_lavoro sl ON mr.scheda_id = sl.id
        WHERE mr.settore = _settore 
        AND mr.articolo_cod = _articolo_cod
        AND mr.stato = 'OUT'
        AND sl.stato NOT IN ('BOZZA', 'ANNULLATA');
    EXCEPTION WHEN OTHERS THEN
        RAISE DEBUG 'Error calculating transit quantity: %', SQLERRM;
        _quantita_in_uscita := 0;
    END;

    -- Return results with kit details
    RETURN QUERY
    SELECT 
        _quantita_totale,
        _quantita_in_kit,
        _quantita_impegnata,
        _quantita_in_uscita,
        (_quantita_totale - _quantita_in_kit - _quantita_impegnata - _quantita_in_uscita),
        COALESCE((
            SELECT json_agg(kit_info ORDER BY kit_nome)
            FROM (
                SELECT 
                    ka.nome as kit_nome,
                    ka.settore as kit_settore,
                    ka.articolo_cod as kit_cod,
                    ka.quantita_kit,
                    kc.quantita as quantita_componente,
                    (ka.quantita_kit * kc.quantita) as totale_impegnato
                FROM kit_componenti kc
                JOIN kit_articoli ka ON kc.kit_id = ka.id
                WHERE kc.componente_settore = _settore 
                AND kc.componente_cod = _articolo_cod
                AND ka.attivo = true
            ) kit_info
        ), '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_giacenza_effettiva TO PUBLIC;

-- Add comment
COMMENT ON FUNCTION get_giacenza_effettiva IS 'Calcola la giacenza effettiva di un articolo includendo dettagli kit';