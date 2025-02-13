-- Drop existing function
DROP FUNCTION IF EXISTS get_disponibilita_futura;

-- Recreate function with proper parameter order and improved error handling
CREATE OR REPLACE FUNCTION get_disponibilita_futura(
    _articolo_cod TEXT,
    _settore TEXT,
    _data DATE DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    _giacenza_effettiva RECORD;
    _impegni_futuri INTEGER;
    _disponibilita INTEGER;
BEGIN
    -- Input validation
    IF _settore IS NULL OR _articolo_cod IS NULL THEN
        RETURN 0;
    END IF;

    -- If no date provided, use current date
    IF _data IS NULL THEN
        _data := CURRENT_DATE;
    END IF;

    -- Get current effective stock with error handling
    BEGIN
        SELECT * FROM get_giacenza_effettiva(_settore, _articolo_cod) INTO _giacenza_effettiva;
        IF NOT FOUND THEN
            RAISE DEBUG 'No giacenza found for %/% at %', _settore, _articolo_cod, _data;
            RETURN 0;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE DEBUG 'Error getting giacenza: %', SQLERRM;
        RETURN 0;
    END;
    
    -- Calculate future commitments with error handling
    BEGIN
        SELECT COALESCE(SUM(mr.quantita), 0)
        INTO _impegni_futuri
        FROM materiali_richiesti mr
        JOIN schede_lavoro sl ON mr.scheda_id = sl.id
        WHERE mr.settore = _settore
        AND mr.articolo_cod = _articolo_cod
        AND sl.data_inizio <= _data
        AND sl.stato NOT IN ('BOZZA', 'ANNULLATA')
        AND mr.stato = 'PRENOTATO';
    EXCEPTION WHEN OTHERS THEN
        RAISE DEBUG 'Error calculating future commitments: %', SQLERRM;
        _impegni_futuri := 0;
    END;

    -- Calculate final availability
    _disponibilita := COALESCE(_giacenza_effettiva.quantita_disponibile, 0) - COALESCE(_impegni_futuri, 0);

    RETURN _disponibilita;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_disponibilita_futura TO PUBLIC;

-- Add comment
COMMENT ON FUNCTION get_disponibilita_futura IS 'Calcola la disponibilità futura di un articolo ad una data specifica, con gestione errori migliorata';

-- Add index to improve performance
CREATE INDEX IF NOT EXISTS idx_materiali_richiesti_data 
ON schede_lavoro(data_inizio);