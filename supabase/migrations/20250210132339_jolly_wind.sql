-- Add quantita_kit column to kit_articoli table
ALTER TABLE kit_articoli
ADD COLUMN quantita_kit INTEGER NOT NULL DEFAULT 1;

-- Add check constraint
ALTER TABLE kit_articoli
ADD CONSTRAINT check_quantita_kit CHECK (quantita_kit > 0);

-- Add function to check kit availability
CREATE OR REPLACE FUNCTION check_kit_availability(
    _settore TEXT,
    _articolo_cod TEXT,
    _quantita_kit INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    _quantita_disponibile INTEGER;
BEGIN
    -- Get available quantity
    EXECUTE format(
        'SELECT quantita FROM articoli_%I WHERE cod = $1',
        lower(_settore)
    ) INTO _quantita_disponibile USING _articolo_cod;

    -- Check if enough quantity is available
    RETURN COALESCE(_quantita_disponibile, 0) >= _quantita_kit;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to validate kit creation
CREATE OR REPLACE FUNCTION validate_kit_creation()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT check_kit_availability(NEW.settore, NEW.articolo_cod, NEW.quantita_kit) THEN
        RAISE EXCEPTION 'Quantità insufficiente per creare il kit';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_kit_quantity
    BEFORE INSERT OR UPDATE ON kit_articoli
    FOR EACH ROW
    EXECUTE FUNCTION validate_kit_creation();