-- Add description column to kit_componenti
ALTER TABLE kit_componenti
ADD COLUMN componente_descrizione TEXT;

-- Create function to update component descriptions
CREATE OR REPLACE FUNCTION update_kit_componente_descrizione()
RETURNS TRIGGER AS $$
DECLARE
    _descrizione TEXT;
BEGIN
    -- Get description from appropriate table
    EXECUTE format(
        'SELECT descrizione FROM articoli_%I WHERE cod = $1',
        lower(NEW.componente_settore)
    ) INTO _descrizione USING NEW.componente_cod;
    
    -- Update description
    NEW.componente_descrizione := _descrizione;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update description
CREATE TRIGGER update_componente_descrizione
    BEFORE INSERT OR UPDATE ON kit_componenti
    FOR EACH ROW
    EXECUTE FUNCTION update_kit_componente_descrizione();

-- Update existing records
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id, componente_settore, componente_cod FROM kit_componenti LOOP
        BEGIN
            EXECUTE format(
                'UPDATE kit_componenti SET componente_descrizione = (
                    SELECT descrizione 
                    FROM articoli_%I 
                    WHERE cod = $1
                ) WHERE id = $2',
                lower(r.componente_settore)
            ) USING r.componente_cod, r.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error updating description for component %: %', r.id, SQLERRM;
        END;
    END LOOP;
END $$;