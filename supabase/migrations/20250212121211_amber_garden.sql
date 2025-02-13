-- Add description column to kit_articoli
ALTER TABLE kit_articoli
ADD COLUMN articolo_descrizione TEXT;

-- Create function to update descriptions
CREATE OR REPLACE FUNCTION update_kit_articolo_descrizione()
RETURNS TRIGGER AS $$
DECLARE
    _descrizione TEXT;
BEGIN
    -- Get description from appropriate table
    EXECUTE format(
        'SELECT descrizione FROM articoli_%I WHERE cod = $1',
        lower(NEW.settore)
    ) INTO _descrizione USING NEW.articolo_cod;
    
    -- Update description
    NEW.articolo_descrizione := _descrizione;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update description
CREATE TRIGGER update_kit_descrizione
    BEFORE INSERT OR UPDATE ON kit_articoli
    FOR EACH ROW
    EXECUTE FUNCTION update_kit_articolo_descrizione();

-- Update existing records
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id, settore, articolo_cod FROM kit_articoli LOOP
        BEGIN
            EXECUTE format(
                'UPDATE kit_articoli SET articolo_descrizione = (
                    SELECT descrizione 
                    FROM articoli_%I 
                    WHERE cod = $1
                ) WHERE id = $2',
                lower(r.settore)
            ) USING r.articolo_cod, r.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error updating description for kit %: %', r.id, SQLERRM;
        END;
    END LOOP;
END $$;