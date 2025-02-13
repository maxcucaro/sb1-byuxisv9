-- Funzione per recuperare i movimenti inventario con dettagli completi
CREATE OR REPLACE FUNCTION get_movimenti_inventario(
    _settore TEXT DEFAULT NULL,
    _articolo_cod TEXT DEFAULT NULL,
    _tipo tipo_movimento DEFAULT NULL,
    _data_inizio TIMESTAMPTZ DEFAULT NULL,
    _data_fine TIMESTAMPTZ DEFAULT NULL,
    _search TEXT DEFAULT NULL,
    _limit INTEGER DEFAULT 50,
    _offset INTEGER DEFAULT 0
) RETURNS TABLE (
    id uuid,
    data_movimento TIMESTAMPTZ,
    settore TEXT,
    articolo_cod TEXT,
    articolo_descrizione TEXT,
    tipo tipo_movimento,
    quantita INTEGER,
    stato stato_movimento,
    scheda_codice TEXT,
    scheda_nome TEXT,
    scheda_data_inizio DATE,
    scheda_data_fine DATE,
    operatore_nome TEXT,
    operatore_cognome TEXT,
    note TEXT,
    ubicazione_origine TEXT,
    ubicazione_destinazione TEXT,
    ddt_numero TEXT,
    ddt_data DATE,
    fornitore_nome TEXT,
    cliente_nome TEXT,
    prezzo DECIMAL(10,2),
    data_inizio_noleggio DATE,
    data_fine_noleggio DATE,
    data_completamento TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    WITH articoli_info AS (
        SELECT 
            cod,
            descrizione,
            'AUDIO' as settore
        FROM articoli_audio
        UNION ALL
        SELECT 
            cod,
            descrizione,
            'LUCI' as settore
        FROM articoli_luci
        UNION ALL
        SELECT 
            cod,
            descrizione,
            'VIDEO' as settore
        FROM articoli_video
        UNION ALL
        SELECT 
            cod,
            descrizione,
            'ELETTRICO' as settore
        FROM articoli_elettrico
        UNION ALL
        SELECT 
            cod,
            descrizione,
            'SEGNALI' as settore
        FROM articoli_segnali
        UNION ALL
        SELECT 
            cod,
            descrizione,
            'STRUTTURE' as settore
        FROM articoli_strutture
        UNION ALL
        SELECT 
            cod,
            descrizione,
            'ALLESTIMENTO' as settore
        FROM articoli_allestimento
        UNION ALL
        SELECT 
            cod,
            descrizione,
            'ATTREZZATURE' as settore
        FROM articoli_attrezzature
        UNION ALL
        SELECT 
            cod,
            descrizione,
            'BACKLINE' as settore
        FROM articoli_backline
        UNION ALL
        SELECT 
            cod,
            descrizione,
            'RIGGHERAGGIO' as settore
        FROM articoli_riggheraggio
        UNION ALL
        SELECT 
            cod,
            descrizione,
            'GENERICO' as settore
        FROM articoli_generico
    )
    SELECT 
        m.id,
        m.data_movimento,
        m.settore,
        m.articolo_cod,
        a.descrizione as articolo_descrizione,
        m.tipo,
        m.quantita,
        m.stato,
        sl.codice as scheda_codice,
        sl.nome as scheda_nome,
        sl.data_inizio as scheda_data_inizio,
        sl.data_fine as scheda_data_fine,
        t.nome as operatore_nome,
        t.cognome as operatore_cognome,
        m.note,
        m.ubicazione_origine,
        m.ubicazione_destinazione,
        m.ddt_numero,
        m.ddt_data,
        f.ragione_sociale as fornitore_nome,
        c.ragione_sociale as cliente_nome,
        m.prezzo,
        m.data_inizio_noleggio,
        m.data_fine_noleggio,
        m.data_completamento
    FROM inventario_movimenti m
    LEFT JOIN articoli_info a ON m.settore = a.settore AND m.articolo_cod = a.cod
    LEFT JOIN schede_lavoro sl ON m.scheda_id = sl.id
    LEFT JOIN team t ON m.operatore_id = t.id
    LEFT JOIN fornitori f ON m.fornitore_id = f.id
    LEFT JOIN clienti c ON m.cliente_id = c.id
    WHERE 
        (_settore IS NULL OR m.settore = _settore)
        AND (_articolo_cod IS NULL OR m.articolo_cod = _articolo_cod)
        AND (_tipo IS NULL OR m.tipo = _tipo)
        AND (_data_inizio IS NULL OR m.data_movimento >= _data_inizio)
        AND (_data_fine IS NULL OR m.data_movimento <= _data_fine)
        AND (_search IS NULL OR 
            m.articolo_cod ILIKE '%' || _search || '%' OR
            a.descrizione ILIKE '%' || _search || '%' OR
            m.note ILIKE '%' || _search || '%' OR
            sl.codice ILIKE '%' || _search || '%' OR
            sl.nome ILIKE '%' || _search || '%'
        )
    ORDER BY m.data_movimento DESC
    LIMIT _limit
    OFFSET _offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_movimenti_inventario TO PUBLIC;

-- Add comment
COMMENT ON FUNCTION get_movimenti_inventario IS 'Recupera i movimenti inventario con tutti i dettagli correlati';

-- Add indexes to improve performance
CREATE INDEX IF NOT EXISTS idx_movimenti_ricerca 
ON inventario_movimenti(settore, articolo_cod, tipo, data_movimento);

CREATE INDEX IF NOT EXISTS idx_movimenti_scheda 
ON inventario_movimenti(scheda_id);

CREATE INDEX IF NOT EXISTS idx_movimenti_operatore 
ON inventario_movimenti(operatore_id);