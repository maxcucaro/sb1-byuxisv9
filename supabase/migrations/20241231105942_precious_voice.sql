-- Create ruoli table
CREATE TABLE ruoli (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT UNIQUE NOT NULL,
    descrizione TEXT,
    permessi TEXT[],
    attivo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE ruoli ENABLE ROW LEVEL SECURITY;

-- Add policies for public access
CREATE POLICY "Accesso pubblico in lettura ruoli"
    ON ruoli
    FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Accesso pubblico in scrittura ruoli"
    ON ruoli
    FOR ALL
    TO PUBLIC
    USING (true)
    WITH CHECK (true);

-- Add trigger for updating timestamp
CREATE TRIGGER update_ruoli_timestamp
    BEFORE UPDATE ON ruoli
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Insert default roles
INSERT INTO ruoli (nome, descrizione, permessi) VALUES
    ('TECNICO', 'Tecnico specializzato', ARRAY['LETTURA', 'SCRITTURA']),
    ('AMMINISTRATIVO', 'Personale amministrativo', ARRAY['LETTURA', 'SCRITTURA', 'MODIFICA']),
    ('MAGAZZINIERE', 'Addetto al magazzino', ARRAY['LETTURA', 'SCRITTURA', 'MODIFICA']),
    ('AUTISTA', 'Autista mezzi aziendali', ARRAY['LETTURA']),
    ('RESPONSABILE', 'Responsabile di settore', ARRAY['LETTURA', 'SCRITTURA', 'MODIFICA', 'ELIMINAZIONE', 'AMMINISTRAZIONE']);