/*
  # Gestione stati materiali e disponibilità

  1. Nuovi Stati
    - Modifica colonna stato per supportare: PRENOTATO, IMPEGNATO, OUT, RIENTRATO
    - Aggiunta campi per tracciare date e DDT

  2. Funzioni
    - get_disponibilita_fisica: calcola disponibilità reale considerando materiali impegnati e out
    - get_disponibilita_futura: calcola disponibilità futura considerando prenotazioni
    - cambia_stato_materiale: gestisce i cambi di stato con relative date e DDT
*/

-- Modifica la colonna stato in materiali_richiesti per supportare i nuovi stati
ALTER TABLE materiali_richiesti 
DROP CONSTRAINT IF EXISTS check_stato_materiale;

ALTER TABLE materiali_richiesti
ALTER COLUMN stato SET DEFAULT 'PRENOTATO',
ADD CONSTRAINT check_stato_materiale 
CHECK (stato IN ('PRENOTATO', 'IMPEGNATO', 'OUT', 'RIENTRATO'));

-- Aggiungi campi per tracciare le date di cambio stato
ALTER TABLE materiali_richiesti
ADD COLUMN data_prenotazione TIMESTAMPTZ DEFAULT now(),
ADD COLUMN data_impegno TIMESTAMPTZ,
ADD COLUMN data_uscita TIMESTAMPTZ,
ADD COLUMN data_rientro TIMESTAMPTZ,
ADD COLUMN ddt_numero TEXT,
ADD COLUMN ddt_data TIMESTAMPTZ;

-- Funzione per calcolare la disponibilità fisica
CREATE OR REPLACE FUNCTION get_disponibilita_fisica(
    _settore TEXT,
    _articolo_cod TEXT
) RETURNS INTEGER AS $$
DECLARE
    _quantita_inventario INTEGER;
    _quantita_impegnata INTEGER;
    _quantita_out INTEGER;
BEGIN
    -- Recupera quantità inventario
    EXECUTE format(
        'SELECT quantita FROM articoli_%I WHERE cod = $1',
        lower(_settore)
    ) INTO _quantita_inventario USING _articolo_cod;

    -- Calcola quantità impegnata e out
    SELECT 
        COALESCE(SUM(CASE WHEN stato = 'IMPEGNATO' THEN quantita ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN stato = 'OUT' THEN quantita ELSE 0 END), 0)
    INTO _quantita_impegnata, _quantita_out
    FROM materiali_richiesti
    WHERE settore = _settore 
    AND articolo_cod = _articolo_cod
    AND stato IN ('IMPEGNATO', 'OUT');

    RETURN COALESCE(_quantita_inventario, 0) - _quantita_impegnata - _quantita_out;
END;
$$ LANGUAGE plpgsql;

-- Funzione per calcolare la disponibilità futura
CREATE OR REPLACE FUNCTION get_disponibilita_futura(
    _settore TEXT,
    _articolo_cod TEXT,
    _data DATE
) RETURNS INTEGER AS $$
DECLARE
    _disponibilita_fisica INTEGER;
    _quantita_prenotata INTEGER;
BEGIN
    -- Recupera disponibilità fisica
    _disponibilita_fisica := get_disponibilita_fisica(_settore, _articolo_cod);

    -- Calcola prenotazioni future
    SELECT COALESCE(SUM(mr.quantita), 0)
    INTO _quantita_prenotata
    FROM materiali_richiesti mr
    JOIN schede_lavoro sl ON mr.scheda_id = sl.id
    WHERE mr.settore = _settore
    AND mr.articolo_cod = _articolo_cod
    AND mr.stato = 'PRENOTATO'
    AND sl.data_inizio <= _data
    AND sl.stato NOT IN ('BOZZA', 'ANNULLATA');

    RETURN _disponibilita_fisica - _quantita_prenotata;
END;
$$ LANGUAGE plpgsql;

-- Funzione per cambiare lo stato di un materiale
CREATE OR REPLACE FUNCTION cambia_stato_materiale(
    p_materiale_id UUID,
    p_nuovo_stato TEXT,
    p_ddt_numero TEXT DEFAULT NULL,
    p_ddt_data TIMESTAMPTZ DEFAULT NULL
) RETURNS materiali_richiesti AS $$
DECLARE
    v_result materiali_richiesti;
BEGIN
    UPDATE materiali_richiesti 
    SET stato = p_nuovo_stato,
        data_impegno = CASE WHEN p_nuovo_stato = 'IMPEGNATO' THEN now() ELSE data_impegno END,
        data_uscita = CASE WHEN p_nuovo_stato = 'OUT' THEN now() ELSE data_uscita END,
        data_rientro = CASE WHEN p_nuovo_stato = 'RIENTRATO' THEN now() ELSE data_rientro END,
        ddt_numero = CASE WHEN p_nuovo_stato = 'OUT' THEN p_ddt_numero ELSE ddt_numero END,
        ddt_data = CASE WHEN p_nuovo_stato = 'OUT' THEN p_ddt_data ELSE ddt_data END
    WHERE id = p_materiale_id
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_disponibilita_fisica TO PUBLIC;
GRANT EXECUTE ON FUNCTION get_disponibilita_futura TO PUBLIC;
GRANT EXECUTE ON FUNCTION cambia_stato_materiale TO PUBLIC;