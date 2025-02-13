-- Add debug function
CREATE OR REPLACE FUNCTION debug_giacenza_effettiva(
    _settore TEXT,
    _articolo_cod TEXT
) RETURNS TABLE (
    step TEXT,
    valore INTEGER
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
    
    RETURN QUERY SELECT 'Quantità totale'::TEXT, COALESCE(_quantita_totale, 0);

    -- Calculate kit usage
    SELECT COALESCE(SUM(kc.quantita * ka.quantita_kit), 0)
    INTO _quantita_in_kit
    FROM kit_componenti kc
    JOIN kit_articoli ka ON kc.kit_id = ka.id
    WHERE kc.componente_settore = _settore 
    AND kc.componente_cod = _articolo_cod
    AND ka.attivo = true;
    
    RETURN QUERY SELECT 'Quantità in kit'::TEXT, COALESCE(_quantita_in_kit, 0);

    -- Calculate committed quantity
    SELECT COALESCE(SUM(mr.quantita), 0)
    INTO _quantita_impegnata
    FROM materiali_richiesti mr
    JOIN schede_lavoro sl ON mr.scheda_id = sl.id
    WHERE mr.settore = _settore 
    AND mr.articolo_cod = _articolo_cod
    AND mr.stato = 'IMPEGNATO'
    AND sl.stato NOT IN ('BOZZA', 'ANNULLATA');
    
    RETURN QUERY SELECT 'Quantità impegnata'::TEXT, COALESCE(_quantita_impegnata, 0);

    -- Calculate quantity in transit
    SELECT COALESCE(SUM(mr.quantita), 0)
    INTO _quantita_in_uscita
    FROM materiali_richiesti mr
    JOIN schede_lavoro sl ON mr.scheda_id = sl.id
    WHERE mr.settore = _settore 
    AND mr.articolo_cod = _articolo_cod
    AND mr.stato = 'OUT'
    AND sl.stato NOT IN ('BOZZA', 'ANNULLATA');
    
    RETURN QUERY SELECT 'Quantità in uscita'::TEXT, COALESCE(_quantita_in_uscita, 0);
    
    -- Calculate available quantity
    RETURN QUERY SELECT 'Quantità disponibile'::TEXT, 
        COALESCE(_quantita_totale - _quantita_in_kit - _quantita_impegnata - _quantita_in_uscita, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add additional indexes
CREATE INDEX IF NOT EXISTS idx_materiali_richiesti_stato 
ON materiali_richiesti(stato);

CREATE INDEX IF NOT EXISTS idx_schede_lavoro_stato 
ON schede_lavoro(stato);

-- Grant execute permission
GRANT EXECUTE ON FUNCTION debug_giacenza_effettiva TO PUBLIC;