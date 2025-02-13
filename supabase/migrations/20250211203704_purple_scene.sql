-- Function to update preparation status
CREATE OR REPLACE FUNCTION aggiorna_stato_preparazione(
    p_materiale_id UUID,
    p_stato TEXT,
    p_operatore_id UUID,
    p_note TEXT DEFAULT NULL
) RETURNS materiali_richiesti AS $$
BEGIN
    IF p_stato = 'IN_PREPARAZIONE' THEN
        UPDATE materiali_richiesti 
        SET stato_preparazione = p_stato,
            operatore_id = p_operatore_id,
            data_inizio_preparazione = NOW(),
            note_preparazione = COALESCE(p_note, note_preparazione)
        WHERE id = p_materiale_id
        RETURNING *;
    ELSIF p_stato = 'PRONTO' THEN
        UPDATE materiali_richiesti 
        SET stato_preparazione = p_stato,
            data_fine_preparazione = NOW(),
            note_preparazione = COALESCE(p_note, note_preparazione)
        WHERE id = p_materiale_id
        RETURNING *;
    ELSE
        UPDATE materiali_richiesti 
        SET stato_preparazione = p_stato,
            note_preparazione = COALESCE(p_note, note_preparazione)
        WHERE id = p_materiale_id
        RETURNING *;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get preparation status for a work order
CREATE OR REPLACE FUNCTION get_stato_preparazione_scheda(p_scheda_id UUID)
RETURNS TABLE (
    totale_materiali BIGINT,
    da_preparare BIGINT,
    in_preparazione BIGINT,
    pronti BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as totale_materiali,
        COUNT(*) FILTER (WHERE stato_preparazione = 'DA_PREPARARE') as da_preparare,
        COUNT(*) FILTER (WHERE stato_preparazione = 'IN_PREPARAZIONE') as in_preparazione,
        COUNT(*) FILTER (WHERE stato_preparazione = 'PRONTO') as pronti
    FROM materiali_richiesti
    WHERE scheda_id = p_scheda_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION aggiorna_stato_preparazione TO PUBLIC;
GRANT EXECUTE ON FUNCTION get_stato_preparazione_scheda TO PUBLIC;