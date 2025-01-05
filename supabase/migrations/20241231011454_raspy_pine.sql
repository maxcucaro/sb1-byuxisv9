/*
  # Creazione tabella imballi e relative funzionalità

  1. Nuove Tabelle
    - `imballi`
      - `id` (uuid, chiave primaria)
      - `codice` (testo, univoco)
      - `descrizione` (testo)
      - `dimensioni` (testo)
      - `peso` (decimale)
      - `capacita` (testo)
      - `note` (testo)
      - `attivo` (booleano)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for public access
*/

CREATE TABLE imballi (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    codice TEXT UNIQUE NOT NULL,
    descrizione TEXT NOT NULL,
    dimensioni TEXT,
    peso DECIMAL(10,2),
    capacita TEXT,
    note TEXT,
    attivo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE imballi ENABLE ROW LEVEL SECURITY;

-- Add policies for public access
CREATE POLICY "Accesso pubblico in lettura imballi"
    ON imballi
    FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Accesso pubblico in scrittura imballi"
    ON imballi
    FOR ALL
    TO PUBLIC
    USING (true)
    WITH CHECK (true);

-- Add trigger for updating timestamp
CREATE TRIGGER update_imballi_timestamp
    BEFORE UPDATE ON imballi
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();