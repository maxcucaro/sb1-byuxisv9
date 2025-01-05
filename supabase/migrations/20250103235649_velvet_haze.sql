/*
  # Funzioni per il calcolo delle giacenze

  1. New Functions
    - `get_giacenza_attuale`: Calcola la giacenza attuale di un articolo
    - `get_giacenza_data`: Calcola la giacenza di un articolo ad una data specifica
    - `get_impegni_futuri`: Recupera gli impegni futuri di un articolo

  2. Changes
    - Aggiunta indici per ottimizzare le query sulle date
*/

-- Funzione per calcolare la giacenza attuale
CREATE OR REPLACE FUNCTION get_giacenza_attuale(
    _settore TEXT,
    _articolo_cod TEXT
) RETURNS INTEGER AS $$
DECLARE
    _quantita INTEGER;
BEGIN
    -- Recupera la quantità dall'articolo
    EXECUTE format(
        'SELECT quantita FROM articoli_%I WHERE cod = $1',
        lower(_settore)
    ) INTO _quantita USING _articolo_cod;
    
    RETURN COALESCE(_quantita, 0);
END;
$$ LANGUAGE plpgsql;

-- Funzione per calcolare la giacenza ad una data specifica
CREATE OR REPLACE FUNCTION get_giacenza_data(
    _settore TEXT,
    _articolo_cod TEXT,
    _data DATE
) RETURNS INTEGER AS $$
DECLARE
    _giacenza_attuale INTEGER;
    _impegni INTEGER;
BEGIN
    -- Recupera giacenza attuale
    _giacenza_attuale := get_giacenza_attuale(_settore, _articolo_cod);
    
    -- Calcola impegni fino alla data
    SELECT COALESCE(SUM(mr.quantita), 0)
    INTO _impegni
    FROM materiali_richiesti mr
    JOIN schede_lavoro sl ON mr.scheda_id = sl.id
    WHERE mr.settore = _settore
    AND mr.articolo_cod = _articolo_cod
    AND sl.data_inizio <= _data
    AND sl.stato NOT IN ('BOZZA', 'ANNULLATA');

    RETURN _giacenza_attuale - _impegni;
END;
$$ LANGUAGE plpgsql;

-- Funzione per recuperare gli impegni futuri
CREATE OR REPLACE FUNCTION get_impegni_futuri(
    _settore TEXT,
    _articolo_cod TEXT,
    _data_inizio DATE
) RETURNS TABLE (
    scheda_id uuid,
    data_inizio DATE,
    data_fine DATE,
    quantita INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sl.id,
        sl.data_inizio,
        sl.data_fine,
        mr.quantita
    FROM materiali_richiesti mr
    JOIN schede_lavoro sl ON mr.scheda_id = sl.id
    WHERE mr.settore = _settore
    AND mr.articolo_cod = _articolo_cod
    AND sl.data_inizio >= _data_inizio
    AND sl.stato NOT IN ('BOZZA', 'ANNULLATA')
    ORDER BY sl.data_inizio;
END;
$$ LANGUAGE plpgsql;

-- Aggiungi indici per ottimizzare le query
CREATE INDEX IF NOT EXISTS idx_materiali_richiesti_articolo 
ON materiali_richiesti(settore, articolo_cod);

CREATE INDEX IF NOT EXISTS idx_schede_lavoro_date 
ON schede_lavoro(data_inizio, data_fine);