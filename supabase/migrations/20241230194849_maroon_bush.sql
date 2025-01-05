/*
  # Schema per gestione articoli Backline

  1. Nuove Tabelle
    - `articoli_backline`
      - `nr` (serial, 4 cifre, primary key)
      - `cod` (codice univoco automatico)
      - `quantita` (numero intero)
      - `descrizione` (testo)
      - `settore` (testo, default 'BACKLINE')
      - `categoria` (testo)
      - `base` (decimale, cm)
      - `altezza` (decimale, cm)
      - `profondita` (decimale, cm)
      - `peso` (decimale, kg)
      - `ubicazione` (testo)

  2. Security
    - Enable RLS
    - Policies per lettura/scrittura per utenti autenticati
*/

CREATE TABLE articoli_backline (
  nr SERIAL PRIMARY KEY,
  cod TEXT UNIQUE NOT NULL DEFAULT 'BL-' || LPAD(CAST(nextval('articoli_backline_nr_seq') as TEXT), 4, '0'),
  quantita INTEGER NOT NULL DEFAULT 0,
  descrizione TEXT NOT NULL,
  settore TEXT NOT NULL DEFAULT 'BACKLINE',
  categoria TEXT NOT NULL,
  base DECIMAL(10,2),
  altezza DECIMAL(10,2),
  profondita DECIMAL(10,2),
  peso DECIMAL(10,2),
  ubicazione TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Abilita Row Level Security
ALTER TABLE articoli_backline ENABLE ROW LEVEL SECURITY;

-- Policy per lettura
CREATE POLICY "Utenti autenticati possono leggere articoli backline"
  ON articoli_backline
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy per inserimento/modifica
CREATE POLICY "Utenti autenticati possono gestire articoli backline"
  ON articoli_backline
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger per aggiornamento timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_articoli_backline_timestamp
  BEFORE UPDATE ON articoli_backline
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();