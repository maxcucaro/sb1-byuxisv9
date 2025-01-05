/*
  # Creazione tabelle anagrafiche

  1. Nuove Tabelle
    - `clienti`
      - `id` (uuid, chiave primaria)
      - `codice` (testo, univoco)
      - `ragione_sociale` (testo)
      - `partita_iva` (testo)
      - `codice_fiscale` (testo)
      - `indirizzo` (testo)
      - `cap` (testo)
      - `citta` (testo)
      - `provincia` (testo)
      - `telefono` (testo)
      - `email` (testo)
      - `pec` (testo)
      - `sdi` (testo)
      - `note` (testo)
      - `attivo` (booleano)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `fornitori` (stessa struttura di clienti)
    
    - `cat` (Collaboratori A Tempo)
      - `id` (uuid, chiave primaria)
      - `codice` (testo, univoco)
      - `nome` (testo)
      - `cognome` (testo)
      - `codice_fiscale` (testo)
      - `partita_iva` (testo)
      - `indirizzo` (testo)
      - `telefono` (testo)
      - `email` (testo)
      - `specializzazione` (testo)
      - `note` (testo)
      - `attivo` (booleano)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `produzioni`
      - `id` (uuid, chiave primaria)
      - `codice` (testo, univoco)
      - `nome` (testo)
      - `descrizione` (testo)
      - `cliente_id` (uuid, foreign key)
      - `data_inizio` (date)
      - `data_fine` (date)
      - `luogo` (testo)
      - `note` (testo)
      - `attivo` (booleano)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for public access
*/

-- Clienti
CREATE TABLE clienti (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    codice TEXT UNIQUE NOT NULL,
    ragione_sociale TEXT NOT NULL,
    partita_iva TEXT,
    codice_fiscale TEXT,
    indirizzo TEXT,
    cap TEXT,
    citta TEXT,
    provincia TEXT,
    telefono TEXT,
    email TEXT,
    pec TEXT,
    sdi TEXT,
    note TEXT,
    attivo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fornitori
CREATE TABLE fornitori (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    codice TEXT UNIQUE NOT NULL,
    ragione_sociale TEXT NOT NULL,
    partita_iva TEXT,
    codice_fiscale TEXT,
    indirizzo TEXT,
    cap TEXT,
    citta TEXT,
    provincia TEXT,
    telefono TEXT,
    email TEXT,
    pec TEXT,
    sdi TEXT,
    note TEXT,
    attivo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- CAT (Collaboratori A Tempo)
CREATE TABLE cat (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    codice TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    cognome TEXT NOT NULL,
    codice_fiscale TEXT,
    partita_iva TEXT,
    indirizzo TEXT,
    telefono TEXT,
    email TEXT,
    specializzazione TEXT,
    note TEXT,
    attivo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Produzioni
CREATE TABLE produzioni (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    codice TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    descrizione TEXT,
    cliente_id uuid REFERENCES clienti(id),
    data_inizio DATE,
    data_fine DATE,
    luogo TEXT,
    note TEXT,
    attivo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and add policies for all tables
DO $$ 
BEGIN
    -- Clienti
    EXECUTE 'ALTER TABLE clienti ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "Accesso pubblico in lettura clienti" ON clienti FOR SELECT TO PUBLIC USING (true)';
    EXECUTE 'CREATE POLICY "Accesso pubblico in scrittura clienti" ON clienti FOR ALL TO PUBLIC USING (true) WITH CHECK (true)';

    -- Fornitori
    EXECUTE 'ALTER TABLE fornitori ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "Accesso pubblico in lettura fornitori" ON fornitori FOR SELECT TO PUBLIC USING (true)';
    EXECUTE 'CREATE POLICY "Accesso pubblico in scrittura fornitori" ON fornitori FOR ALL TO PUBLIC USING (true) WITH CHECK (true)';

    -- CAT
    EXECUTE 'ALTER TABLE cat ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "Accesso pubblico in lettura cat" ON cat FOR SELECT TO PUBLIC USING (true)';
    EXECUTE 'CREATE POLICY "Accesso pubblico in scrittura cat" ON cat FOR ALL TO PUBLIC USING (true) WITH CHECK (true)';

    -- Produzioni
    EXECUTE 'ALTER TABLE produzioni ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "Accesso pubblico in lettura produzioni" ON produzioni FOR SELECT TO PUBLIC USING (true)';
    EXECUTE 'CREATE POLICY "Accesso pubblico in scrittura produzioni" ON produzioni FOR ALL TO PUBLIC USING (true) WITH CHECK (true)';
END $$;

-- Add update triggers for all tables
DO $$
BEGIN
    EXECUTE 'CREATE TRIGGER update_clienti_timestamp BEFORE UPDATE ON clienti FOR EACH ROW EXECUTE FUNCTION update_updated_at()';
    EXECUTE 'CREATE TRIGGER update_fornitori_timestamp BEFORE UPDATE ON fornitori FOR EACH ROW EXECUTE FUNCTION update_updated_at()';
    EXECUTE 'CREATE TRIGGER update_cat_timestamp BEFORE UPDATE ON cat FOR EACH ROW EXECUTE FUNCTION update_updated_at()';
    EXECUTE 'CREATE TRIGGER update_produzioni_timestamp BEFORE UPDATE ON produzioni FOR EACH ROW EXECUTE FUNCTION update_updated_at()';
END $$;