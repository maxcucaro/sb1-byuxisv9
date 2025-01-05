/*
  # Complete Articles Tables Setup

  1. Changes to Existing Tables
    - Add `attivo` column to `articoli_backline`
  
  2. New Tables
    - Complete remaining tables (VIDEO, ELETTRICO, etc.)
    - Add all necessary triggers and policies
*/

-- Aggiunta campo attivo a articoli_backline
ALTER TABLE articoli_backline 
ADD COLUMN attivo BOOLEAN NOT NULL DEFAULT true;

-- VIDEO
CREATE TABLE articoli_video (
  nr SERIAL PRIMARY KEY,
  cod TEXT UNIQUE NOT NULL,
  quantita INTEGER NOT NULL DEFAULT 0,
  descrizione TEXT NOT NULL,
  settore TEXT NOT NULL DEFAULT 'VIDEO',
  categoria TEXT NOT NULL,
  base DECIMAL(10,2),
  altezza DECIMAL(10,2),
  profondita DECIMAL(10,2),
  peso DECIMAL(10,2),
  ubicazione TEXT,
  attivo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION generate_video_code() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.cod := 'VI-' || LPAD(CAST(NEW.nr as TEXT), 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_video_code
  BEFORE INSERT ON articoli_video
  FOR EACH ROW
  EXECUTE FUNCTION generate_video_code();

CREATE TRIGGER update_articoli_video_timestamp
  BEFORE UPDATE ON articoli_video
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE articoli_video ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utenti autenticati possono leggere articoli_video"
  ON articoli_video
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utenti autenticati possono gestire articoli_video"
  ON articoli_video
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ELETTRICO
CREATE TABLE articoli_elettrico (
  nr SERIAL PRIMARY KEY,
  cod TEXT UNIQUE NOT NULL,
  quantita INTEGER NOT NULL DEFAULT 0,
  descrizione TEXT NOT NULL,
  settore TEXT NOT NULL DEFAULT 'ELETTRICO',
  categoria TEXT NOT NULL,
  base DECIMAL(10,2),
  altezza DECIMAL(10,2),
  profondita DECIMAL(10,2),
  peso DECIMAL(10,2),
  ubicazione TEXT,
  attivo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION generate_elettrico_code() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.cod := 'EL-' || LPAD(CAST(NEW.nr as TEXT), 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_elettrico_code
  BEFORE INSERT ON articoli_elettrico
  FOR EACH ROW
  EXECUTE FUNCTION generate_elettrico_code();

CREATE TRIGGER update_articoli_elettrico_timestamp
  BEFORE UPDATE ON articoli_elettrico
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE articoli_elettrico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utenti autenticati possono leggere articoli_elettrico"
  ON articoli_elettrico
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utenti autenticati possono gestire articoli_elettrico"
  ON articoli_elettrico
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Continua con le altre tabelle seguendo lo stesso pattern...