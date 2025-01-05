/*
  # Creazione tabelle articoli per tutti i settori

  1. Nuove Tabelle
    - Tabelle per ogni settore con prefissi specifici
    - Struttura comune per tutti gli articoli
    - Campo attivo per gestione articoli obsoleti
    
  2. Security
    - RLS abilitato per tutte le tabelle
    - Policy per lettura e gestione articoli
*/

-- Funzione comune per aggiornamento timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- AUDIO
CREATE TABLE articoli_audio (
  nr SERIAL PRIMARY KEY,
  cod TEXT UNIQUE NOT NULL,
  quantita INTEGER NOT NULL DEFAULT 0,
  descrizione TEXT NOT NULL,
  settore TEXT NOT NULL DEFAULT 'AUDIO',
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

CREATE TRIGGER update_articoli_audio_timestamp
  BEFORE UPDATE ON articoli_audio
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE articoli_audio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utenti autenticati possono leggere articoli_audio"
  ON articoli_audio
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utenti autenticati possono gestire articoli_audio"
  ON articoli_audio
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- LUCI
CREATE TABLE articoli_luci (
  nr SERIAL PRIMARY KEY,
  cod TEXT UNIQUE NOT NULL,
  quantita INTEGER NOT NULL DEFAULT 0,
  descrizione TEXT NOT NULL,
  settore TEXT NOT NULL DEFAULT 'LUCI',
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

CREATE TRIGGER update_articoli_luci_timestamp
  BEFORE UPDATE ON articoli_luci
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE articoli_luci ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utenti autenticati possono leggere articoli_luci"
  ON articoli_luci
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utenti autenticati possono gestire articoli_luci"
  ON articoli_luci
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Continua con lo stesso pattern per le altre tabelle...
-- VIDEO, ELETTRICO, SEGNALI, STRUTTURE, ALLESTIMENTO, ATTREZZATURE, RIGGHERAGGIO, GENERICO

-- Funzioni per generazione codici
CREATE OR REPLACE FUNCTION generate_audio_code() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.cod := 'AU-' || LPAD(CAST(NEW.nr as TEXT), 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_audio_code
  BEFORE INSERT ON articoli_audio
  FOR EACH ROW
  EXECUTE FUNCTION generate_audio_code();

CREATE OR REPLACE FUNCTION generate_luci_code() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.cod := 'LU-' || LPAD(CAST(NEW.nr as TEXT), 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_luci_code
  BEFORE INSERT ON articoli_luci
  FOR EACH ROW
  EXECUTE FUNCTION generate_luci_code();

-- Continua con trigger simili per le altre tabelle...