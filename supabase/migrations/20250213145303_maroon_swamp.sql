-- Add function to get impegni futuri with proper join syntax
CREATE OR REPLACE FUNCTION get_impegni_futuri(
    _settore TEXT,
    _articolo_cod TEXT,
    _data_inizio DATE
) RETURNS TABLE (
    codice TEXT,
    nome TEXT,
    data_inizio DATE,
    data_fine DATE,
    stato TEXT,
    quantita INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sl.codice,
        sl.nome,
        sl.data_inizio,
        sl.data_fine,
        sl.stato,
        mr.quantita
    FROM materiali_richiesti mr
    INNER JOIN schede_lavoro sl ON mr.scheda_id = sl.id
    WHERE mr.settore = _settore
    AND mr.articolo_cod = _articolo_cod
    AND sl.data_inizio >= _data_inizio
    AND sl.stato NOT IN ('BOZZA', 'ANNULLATA')
    ORDER BY sl.data_inizio ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_impegni_futuri TO PUBLIC;

-- Add comment
COMMENT ON FUNCTION get_impegni_futuri IS 'Restituisce gli impegni futuri per un articolo a partire da una data';

-- Add index to improve performance
CREATE INDEX IF NOT EXISTS idx_materiali_richiesti_impegni
ON materiali_richiesti(settore, articolo_cod);