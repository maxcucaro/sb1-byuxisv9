/*
  # Create Mezzi Table

  1. New Tables
    - `mezzi`
      - `id` (uuid, primary key)
      - `codice` (text, unique)
      - `tipo` (text)
      - `marca` (text)
      - `modello` (text)
      - `targa` (text)
      - `portata` (decimal)
      - `dimensioni` (text)
      - `note` (text)
      - `attivo` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `mezzi` table
    - Add policy for public access
*/

-- Create mezzi table
CREATE TABLE mezzi (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    codice TEXT UNIQUE NOT NULL,
    tipo TEXT NOT NULL,
    marca TEXT NOT NULL,
    modello TEXT NOT NULL,
    targa TEXT NOT NULL,
    portata DECIMAL(10,2),
    dimensioni TEXT,
    note TEXT,
    attivo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE mezzi ENABLE ROW LEVEL SECURITY;

-- Add policies for public access
CREATE POLICY "Accesso pubblico in lettura mezzi"
    ON mezzi
    FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Accesso pubblico in scrittura mezzi"
    ON mezzi
    FOR ALL
    TO PUBLIC
    USING (true)
    WITH CHECK (true);

-- Add trigger for updating timestamp
CREATE TRIGGER update_mezzi_timestamp
    BEFORE UPDATE ON mezzi
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Create function for generating codice
CREATE OR REPLACE FUNCTION generate_mezzo_code() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codice IS NULL OR NEW.codice = '' THEN
        NEW.codice := 'MZ-' || LPAD(CAST((
            SELECT COALESCE(MAX(CAST(SUBSTRING(codice FROM 4) AS INTEGER)), 0) + 1
            FROM mezzi
            WHERE codice LIKE 'MZ-%'
        ) AS TEXT), 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating codice
CREATE TRIGGER set_mezzo_code
    BEFORE INSERT ON mezzi
    FOR EACH ROW
    EXECUTE FUNCTION generate_mezzo_code();