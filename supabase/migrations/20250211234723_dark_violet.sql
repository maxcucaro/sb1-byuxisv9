-- Function to calculate future availability
CREATE OR REPLACE FUNCTION get_disponibilita_futura(
    _settore TEXT,
    _articolo_cod TEXT,
    _data DATE
) RETURNS INTEGER AS $$
DECLARE
    _giacenza_effettiva RECORD;
    _impegni_futuri INTEGER;
BEGIN
    -- Get current effective stock
    SELECT * FROM get_giacenza_effettiva(_settore, _articolo_cod) INTO _giacenza_effettiva;
    
    -- Calculate future commitments
    SELECT COALESCE(SUM(mr.quantita), 0)
    INTO _impegni_futuri
    FROM materiali_richiesti mr
    JOIN schede_lavoro sl ON mr.scheda_id = sl.id
    WHERE mr.settore = _settore
    AND mr.articolo_cod = _articolo_cod
    AND sl.data_inizio <= _data
    AND sl.stato NOT IN ('BOZZA', 'ANNULLATA')
    AND mr.stato = 'PRENOTATO';

    -- Return available quantity
    RETURN _giacenza_effettiva.quantita_disponibile - _impegni_futuri;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_disponibilita_futura TO PUBLIC;