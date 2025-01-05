/*
  # Aggiunta tabella tipologie_lavoro

  1. Nuove Tabelle
    - `tipologie_lavoro`
      - `tipo` (text, primary key) - Tipo di lavoro (INTERNO, NOLEGGIO, CONTOVISIONE, ASSISTENZA)
      - `attivo` (boolean) - Stato attivo/inattivo
      - `richiedi_cliente` (boolean) - Se richiede un cliente
      - `richiedi_preventivo` (boolean) - Se richiede un preventivo
      - `richiedi_ddt` (boolean) - Se richiede un DDT
      - `note` (text) - Note aggiuntive
      
  2. Security
    - Enable RLS
    - Add policies for public access
*/

CREATE TABLE tipologie_lavoro (
    tipo TEXT PRIMARY KEY,
    attivo BOOLEAN DEFAULT true,
    richiedi_cliente BOOLEAN DEFAULT false,
    richiedi_preventivo BOOLEAN DEFAULT false,
    richiedi_ddt BOOLEAN DEFAULT false,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE tipologie_lavoro ENABLE ROW LEVEL SECURITY;

-- Add policies for public access
CREATE POLICY "Accesso pubblico in lettura tipologie_lavoro"
    ON tipologie_lavoro
    FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Accesso pubblico in scrittura tipologie_lavoro"
    ON tipologie_lavoro
    FOR ALL
    TO PUBLIC
    USING (true)
    WITH CHECK (true);

-- Add trigger for updating timestamp
CREATE TRIGGER update_tipologie_lavoro_timestamp
    BEFORE UPDATE ON tipologie_lavoro
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Insert default types
INSERT INTO tipologie_lavoro (tipo, attivo) VALUES
    ('INTERNO', true),
    ('NOLEGGIO', true),
    ('CONTOVISIONE', true),
    ('ASSISTENZA', true);