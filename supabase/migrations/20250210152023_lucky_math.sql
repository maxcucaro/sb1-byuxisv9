-- Create kit_articoli table if it doesn't exist
CREATE TABLE IF NOT EXISTS kit_articoli (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    settore TEXT NOT NULL,
    articolo_cod TEXT NOT NULL,
    nome TEXT NOT NULL,
    descrizione TEXT,
    quantita_kit INTEGER NOT NULL DEFAULT 1,
    note TEXT,
    attivo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(settore, articolo_cod)
);

-- Create kit_componenti table if it doesn't exist
CREATE TABLE IF NOT EXISTS kit_componenti (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    kit_id uuid REFERENCES kit_articoli(id) ON DELETE CASCADE,
    componente_settore TEXT NOT NULL,
    componente_cod TEXT NOT NULL,
    quantita INTEGER NOT NULL CHECK (quantita > 0),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE kit_articoli ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_componenti ENABLE ROW LEVEL SECURITY;

-- Add policies for public access
CREATE POLICY "Accesso pubblico in lettura kit_articoli"
    ON kit_articoli FOR SELECT TO PUBLIC USING (true);

CREATE POLICY "Accesso pubblico in scrittura kit_articoli"
    ON kit_articoli FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

CREATE POLICY "Accesso pubblico in lettura kit_componenti"
    ON kit_componenti FOR SELECT TO PUBLIC USING (true);

CREATE POLICY "Accesso pubblico in scrittura kit_componenti"
    ON kit_componenti FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

-- Add trigger for updating timestamp
CREATE TRIGGER update_kit_articoli_timestamp
    BEFORE UPDATE ON kit_articoli
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();