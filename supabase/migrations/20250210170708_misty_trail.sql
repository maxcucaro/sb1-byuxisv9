sql
/*
  # Add stored procedure for updating materiali richiesti

  1. New Functions
    - aggiorna_materiali_richiesti: Updates materiali_richiesti for a scheda
      - p_scheda_id: UUID of the scheda
      - p_materiali: Array of materiali to update
      
  2. Security
    - Function accessible to all authenticated users
    
  3. Changes
    - Adds new stored procedure
    - Handles deleting existing materiali and inserting new ones
*/

-- Create type for materiale input
CREATE TYPE materiale_input AS (
    settore TEXT,
    cod TEXT,
    quantita INTEGER,
    note TEXT
);

-- Create function to update materiali richiesti
CREATE OR REPLACE FUNCTION aggiorna_materiali_richiesti(
    p_scheda_id UUID,
    p_materiali materiale_input[]
) RETURNS SETOF materiali_richiesti AS $$
BEGIN
    -- Delete existing materiali for this scheda
    DELETE FROM materiali_richiesti WHERE scheda_id = p_scheda_id;
    
    -- Insert new materiali
    RETURN QUERY
    INSERT INTO materiali_richiesti (
        scheda_id,
        settore,
        articolo_cod,
        quantita,
        note,
        stato
    )
    SELECT 
        p_scheda_id,
        m.settore,
        m.cod,
        m.quantita,
        m.note,
        'RICHIESTO'
    FROM unnest(p_materiali) m
    RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION aggiorna_materiali_richiesti TO PUBLIC;
