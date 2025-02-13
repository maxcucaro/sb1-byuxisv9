-- Drop existing function if exists
DROP FUNCTION IF EXISTS get_kit_completo;

-- Create function to get complete kit details
CREATE OR REPLACE FUNCTION get_kit_completo(
    _settore TEXT,
    _articolo_cod TEXT
) RETURNS TABLE (
    id uuid,
    settore TEXT,
    articolo_cod TEXT,
    articolo_descrizione TEXT,
    nome TEXT,
    descrizione TEXT,
    quantita_kit INTEGER,
    note TEXT,
    attivo BOOLEAN,
    componenti JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ka.id,
        ka.settore,
        ka.articolo_cod,
        ka.articolo_descrizione,
        ka.nome,
        ka.descrizione,
        ka.quantita_kit,
        ka.note,
        ka.attivo,
        COALESCE(
            (SELECT json_agg(
                json_build_object(
                    'id', kc.id,
                    'componente_settore', kc.componente_settore,
                    'componente_cod', kc.componente_cod,
                    'componente_descrizione', kc.componente_descrizione,
                    'quantita', kc.quantita,
                    'note', kc.note
                )
            )
            FROM kit_componenti kc
            WHERE kc.kit_id = ka.id
            ORDER BY kc.componente_settore, kc.componente_cod),
            '[]'::json
        ) as componenti
    FROM kit_articoli ka
    WHERE ka.settore = _settore
    AND ka.articolo_cod = _articolo_cod;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_kit_completo TO PUBLIC;

-- Add comment
COMMENT ON FUNCTION get_kit_completo IS 'Recupera i dettagli completi di un kit inclusi i suoi componenti';