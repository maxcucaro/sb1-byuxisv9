-- Drop existing function
DROP FUNCTION IF EXISTS get_giacenza_effettiva_all;

-- Recreate function with fixed column references
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
            'AUDIO'::TEXT as settore, 
            a.cod, 
            a.descrizione, 
            a.categoria, 
            a.quantita::INTEGER, 
            a.ubicazione, 
            a.attivo
        FROM articoli_audio a
        UNION ALL
        SELECT 
            'LUCI'::TEXT, 
            l.cod, 
            l.descrizione, 
            l.categoria, 
            l.quantita::INTEGER, 
            l.ubicazione, 
            l.attivo
        FROM articoli_luci l
        UNION ALL
        SELECT 
            'VIDEO'::TEXT, 
            v.cod, 
            v.descrizione, 
            v.categoria, 
            v.quantita::INTEGER, 
            v.ubicazione, 
            v.attivo
        FROM articoli_video v
        UNION ALL
        SELECT 
            'ELETTRICO'::TEXT, 
            e.cod, 
            e.descrizione, 
            e.categoria, 
            e.quantita::INTEGER, 
            e.ubicazione, 
            e.attivo
        FROM articoli_elettrico e
        UNION ALL
        SELECT 
            'SEGNALI'::TEXT, 
            s.cod, 
            s.descrizione, 
            s.categoria, 
            s.quantita::INTEGER, 
            s.ubicazione, 
            s.attivo
        FROM articoli_segnali s
        UNION ALL
        SELECT 
            'STRUTTURE'::TEXT, 
            st.cod, 
            st.descrizione, 
            st.categoria, 
            st.quantita::INTEGER, 
            st.ubicazione, 
            st.attivo
        FROM articoli_strutture st
        UNION ALL
        SELECT 
            'ALLESTIMENTO'::TEXT, 
            al.cod, 
            al.descrizione, 
            al.categoria, 
            al.quantita::INTEGER, 
            al.ubicazione, 
            al.attivo
        FROM articoli_allestimento al
        UNION ALL
        SELECT 
            'ATTREZZATURE'::TEXT, 
            at.cod, 
            at.descrizione, 
            at.categoria, 
            at.quantita::INTEGER, 
            at.ubicazione, 
            at.attivo
        FROM articoli_attrezzature at
        UNION ALL
        SELECT 
            'BACKLINE'::TEXT, 
            b.cod, 
            b.descrizione, 
            b.categoria, 
            b.quantita::INTEGER, 
            b.ubicazione, 
            b.attivo
        FROM articoli_backline b
        UNION ALL
        SELECT 
            'RIGGHERAGGIO'::TEXT, 
            r.cod, 
            r.descrizione, 
            r.categoria, 
            r.quantita::INTEGER, 
            r.ubicazione, 
            r.attivo
        FROM articoli_riggheraggio r
        UNION ALL
        SELECT 
            'GENERICO'::TEXT, 
            g.cod, 
            g.descrizione, 
            g.categoria, 
            g.quantita::INTEGER, 
            g.ubicazione, 
            g.attivo
        FROM articoli_generico g
    )
    SELECT 
        a.settore,
        a.cod,
        a.descrizione,
        a.categoria,
        a.quantita as quantita_totale,
        COALESCE(
            (SELECT SUM(kc.quantita * ka.quantita_kit)::INTEGER
            FROM kit_componenti kc
            JOIN kit_articoli ka ON kc.kit_id = ka.id
            WHERE kc.componente_settore = a.settore 
            AND kc.componente_cod = a.cod
            AND ka.attivo = true),
            0
        ) as quantita_in_kit,
        COALESCE(
            (SELECT SUM(mr.quantita)::INTEGER
            FROM materiali_richiesti mr
            JOIN schede_lavoro sl ON mr.scheda_id = sl.id
            WHERE mr.settore = a.settore 
            AND mr.articolo_cod = a.cod
            AND mr.stato = 'IMPEGNATO'
            AND sl.stato NOT IN ('BOZZA', 'ANNULLATA')),
            0
        ) as quantita_impegnata,
        COALESCE(
            (SELECT SUM(mr.quantita)::INTEGER
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
                (SELECT SUM(kc.quantita * ka.quantita_kit)::INTEGER
                FROM kit_componenti kc
                JOIN kit_articoli ka ON kc.kit_id = ka.id
                WHERE kc.componente_settore = a.settore 
                AND kc.componente_cod = a.cod
                AND ka.attivo = true),
                0
            ) -
            COALESCE(
                (SELECT SUM(mr.quantita)::INTEGER
                FROM materiali_richiesti mr
                JOIN schede_lavoro sl ON mr.scheda_id = sl.id
                WHERE mr.settore = a.settore 
                AND mr.articolo_cod = a.cod
                AND mr.stato IN ('IMPEGNATO', 'OUT')
                AND sl.stato NOT IN ('BOZZA', 'ANNULLATA')),
                0
            )
        )::INTEGER as quantita_disponibile,
        a.ubicazione,
        a.attivo
    FROM articoli a
    WHERE a.attivo = true
    ORDER BY a.settore, a.categoria, a.descrizione;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_giacenza_effettiva_all TO PUBLIC;