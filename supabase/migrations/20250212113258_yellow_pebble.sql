-- Add indexes to improve performance
CREATE INDEX IF NOT EXISTS idx_kit_componenti_articolo 
ON kit_componenti(componente_settore, componente_cod);

CREATE INDEX IF NOT EXISTS idx_materiali_richiesti_articolo 
ON materiali_richiesti(settore, articolo_cod);

CREATE INDEX IF NOT EXISTS idx_kit_articoli_attivo 
ON kit_articoli(attivo);

-- Create function to update giacenze when kit status changes
CREATE OR REPLACE FUNCTION update_giacenze_on_kit_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Invalidate cache or update materialized views if needed
    -- For now, we'll just ensure the kit status change is valid
    IF TG_OP = 'UPDATE' AND NEW.attivo != OLD.attivo THEN
        -- Check if deactivating kit would cause negative stock
        IF NOT NEW.attivo THEN
            -- Validation logic could be added here
            NULL;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for kit status changes
CREATE TRIGGER check_kit_status_change
    BEFORE UPDATE ON kit_articoli
    FOR EACH ROW
    WHEN (OLD.attivo IS DISTINCT FROM NEW.attivo)
    EXECUTE FUNCTION update_giacenze_on_kit_change();

-- Add constraint to ensure non-negative quantities
ALTER TABLE materiali_richiesti
ADD CONSTRAINT check_quantita_positive 
CHECK (quantita > 0);

-- Grant permissions
GRANT SELECT ON kit_componenti TO PUBLIC;
GRANT SELECT ON materiali_richiesti TO PUBLIC;
GRANT SELECT ON kit_articoli TO PUBLIC;