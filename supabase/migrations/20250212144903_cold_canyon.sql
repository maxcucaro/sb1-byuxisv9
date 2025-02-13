-- Create function to get all giacenze
CREATE OR REPLACE FUNCTION get_giacenza_effettiva_all()
RETURNS TABLE (
    settore TEXT,
    cod TEXT,
    descrizione TEXT,
    categoria TEXT,
    quantita_totale INTEGER,
    quantita_in_kit INTEGER,
    quantita_impegnata INTEGER,
    quantita_in_uscita INTEGER,
    quantita_disponibile INTEGER,
    ubicazione TEXT,
    attivo BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH articoli AS (
        SELECT 
            'AUDIO' as settore, cod, descrizione, categoria, quantita, ubicazione, attivo
        FROM articoli_audio
        UNION ALL
        SELECT 
            'LUCI' as settore, cod, descrizione, categoria, quantita, ubicazione, attivo
        FROM articoli_luci
        UNION ALL
        SELECT 
            'VIDEO' as settore, cod, descrizione, categoria, quantita, ubicazione, attivo
        FROM articoli_video
        UNION ALL
        SELECT 
            'ELETTRICO' as settore, cod, descrizione, categoria, quantita, ubicazione, attivo
        FROM articoli_elettrico
        UNION ALL
        SELECT 
            'SEGNALI' as settore, cod, descrizione, categoria, quantita, ubicazione, attivo
        FROM articoli_segnali
        UNION ALL
        SELECT 
            'STRUTTURE' as settore, cod, descrizione, categoria, quantita, ubicazione, attivo
        FROM articoli_strutture
        UNION ALL
        SELECT 
            'ALLESTIMENTO' as settore, cod, descrizione, categoria, quantita, ubicazione, attivo
        FROM articoli_allestimento
        UNION ALL
        SELECT 
            'ATTREZZATURE' as settore, cod, descrizione, categoria, quantita, ubicazione, attivo
        FROM articoli_attrezzature
        UNION ALL
        SELECT 
            'BACKLINE' as settore, cod, descrizione, categoria, quantita, ubicazione, attivo
        FROM articoli_backline
        UNION ALL
        SELECT 
            'RIGGHERAGGIO' as settore, cod, descrizione, categoria, quantita, ubicazione, attivo
        FROM articoli_riggheraggio
        UNION ALL
        SELECT 
            'GENERICO' as settore, cod, descrizione, categoria, quantita, ubicazione, attivo
        FROM articoli_generico
    )
    SELECT 
        a.settore,
        a.cod,
        a.descrizione,
        a.categoria,
        a.quantita as quantita_totale,
        COALESCE(
            (SELECT SUM(kc.quantita * ka.quantita_kit)
            FROM kit_componenti kc
            JOIN kit_articoli ka ON kc.kit_id = ka.id
            WHERE kc.componente_settore = a.settore 
            AND kc.componente_cod = a.cod
            AND ka.attivo = true),
            0
        ) as quantita_in_kit,
        COALESCE(
            (SELECT SUM(mr.quantita)
            FROM materiali_richiesti mr
            JOIN schede_lavoro sl ON mr.scheda_id = sl.id
            WHERE mr.settore = a.settore 
            AND mr.articolo_cod = a.cod
            AND mr.stato = 'IMPEGNATO'
            AND sl.stato NOT IN ('BOZZA', 'ANNULLATA')),
            0
        ) as quantita_impegnata,
        COALESCE(
            (SELECT SUM(mr.quantita)
            FROM materiali_richiesti mr
            JOIN schede_lavoro sl ON mr.scheda_id = sl.id
            WHERE mr.settore = a.settore 
            AND mr.articolo_cod = a.cod
            AND mr.stato = 'OUT'
            AND sl.stato NOT IN ('BOZZA', 'ANNULLATA')),
            0
        ) as quantita_in_uscita,
        (a.quantita - 
            COALESCE(
                (SELECT SUM(kc.quantita * ka.quantita_kit)
                FROM kit_componenti kc
                JOIN kit_articoli ka ON kc.kit_id = ka.id
                WHERE kc.componente_settore = a.settore 
                AND kc.componente_cod = a.cod
                AND ka.attivo = true),
                0
            ) -
            COALESCE(
                (SELECT SUM(mr.quantita)
                FROM materiali_richiesti mr
                JOIN schede_lavoro sl ON mr.scheda_id = sl.id
                WHERE mr.settore = a.settore 
                AND mr.articolo_cod = a.cod
                AND mr.stato IN ('IMPEGNATO', 'OUT')
                AND sl.stato NOT IN ('BOZZA', 'ANNULLATA')),
                0
            )
        ) as quantita_disponibile,
        a.ubicazione,
        a.attivo
    FROM articoli a
    WHERE a.attivo = true
    ORDER BY a.settore, a.categoria, a.descrizione;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_giacenza_effettiva_all TO PUBLIC;