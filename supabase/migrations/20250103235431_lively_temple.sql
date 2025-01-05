/*
  # Schema per gestione materiali richiesti

  1. New Tables
    - `materiali_richiesti`
      - `id` (uuid, primary key)
      - `scheda_id` (uuid, foreign key to schede_lavoro)
      - `settore` (text)
      - `articolo_cod` (text) 
      - `quantita` (integer)
      - `note` (text)
      - `stato` (text) - Per tracciare lo stato della richiesta
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for public access
*/

-- Create materiali_richiesti table
CREATE TABLE materiali_richiesti (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    scheda_id uuid REFERENCES schede_lavoro(id) ON DELETE CASCADE,
    settore TEXT NOT NULL,
    articolo_cod TEXT NOT NULL,
    quantita INTEGER NOT NULL CHECK (quantita > 0),
    note TEXT,
    stato TEXT NOT NULL DEFAULT 'RICHIESTO',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE materiali_richiesti ENABLE ROW LEVEL SECURITY;

-- Add policies for public access
CREATE POLICY "Accesso pubblico in lettura materiali_richiesti"
    ON materiali_richiesti
    FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Accesso pubblico in scrittura materiali_richiesti"
    ON materiali_richiesti
    FOR ALL
    TO PUBLIC
    USING (true)
    WITH CHECK (true);

-- Add trigger for updating timestamp
CREATE TRIGGER update_materiali_richiesti_timestamp
    BEFORE UPDATE ON materiali_richiesti
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();