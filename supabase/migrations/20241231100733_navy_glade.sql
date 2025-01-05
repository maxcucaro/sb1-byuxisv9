-- Create team table
CREATE TABLE team (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    codice TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    cognome TEXT NOT NULL,
    ruolo TEXT NOT NULL,
    telefono TEXT,
    email TEXT,
    indirizzo TEXT,
    note TEXT,
    attivo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE team ENABLE ROW LEVEL SECURITY;

-- Add policies for public access
CREATE POLICY "Accesso pubblico in lettura team"
    ON team
    FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Accesso pubblico in scrittura team"
    ON team
    FOR ALL
    TO PUBLIC
    USING (true)
    WITH CHECK (true);

-- Add trigger for updating timestamp
CREATE TRIGGER update_team_timestamp
    BEFORE UPDATE ON team
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Create function for generating codice
CREATE OR REPLACE FUNCTION generate_team_code() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codice IS NULL OR NEW.codice = '' THEN
        NEW.codice := 'DP-' || LPAD(CAST((
            SELECT COALESCE(MAX(CAST(SUBSTRING(codice FROM 4) AS INTEGER)), 0) + 1
            FROM team
            WHERE codice LIKE 'DP-%'
        ) AS TEXT), 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating codice
CREATE TRIGGER set_team_code
    BEFORE INSERT ON team
    FOR EACH ROW
    EXECUTE FUNCTION generate_team_code();