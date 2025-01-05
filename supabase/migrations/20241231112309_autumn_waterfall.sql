-- Tabella principale schede lavoro
CREATE TABLE schede_lavoro (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    codice TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    produzione_id uuid REFERENCES produzioni(id),
    data_inizio DATE NOT NULL,
    data_fine DATE NOT NULL,
    luogo TEXT NOT NULL,
    responsabile_id uuid REFERENCES team(id),
    stato TEXT NOT NULL DEFAULT 'BOZZA',
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella per il personale assegnato
CREATE TABLE schede_lavoro_personale (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    scheda_id uuid REFERENCES schede_lavoro(id) ON DELETE CASCADE,
    dipendente_id uuid REFERENCES team(id),
    ruolo TEXT NOT NULL,
    data_inizio DATE NOT NULL,
    data_fine DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella per le attrezzature assegnate
CREATE TABLE schede_lavoro_attrezzature (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    scheda_id uuid REFERENCES schede_lavoro(id) ON DELETE CASCADE,
    settore TEXT NOT NULL,
    articolo_cod TEXT NOT NULL,
    quantita INTEGER NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella per i mezzi assegnati
CREATE TABLE schede_lavoro_mezzi (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    scheda_id uuid REFERENCES schede_lavoro(id) ON DELETE CASCADE,
    mezzo_id uuid REFERENCES mezzi(id),
    data_inizio DATE NOT NULL,
    data_fine DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella per gli imballi assegnati
CREATE TABLE schede_lavoro_imballi (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    scheda_id uuid REFERENCES schede_lavoro(id) ON DELETE CASCADE,
    imballo_id uuid REFERENCES imballi(id),
    quantita INTEGER NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Funzione per generare il codice scheda
CREATE OR REPLACE FUNCTION generate_scheda_code() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codice IS NULL OR NEW.codice = '' THEN
        NEW.codice := 'SC-' || TO_CHAR(NEW.data_inizio, 'YYMM') || '-' || 
            LPAD(CAST((
                SELECT COALESCE(MAX(CAST(SUBSTRING(codice FROM 10) AS INTEGER)), 0) + 1
                FROM schede_lavoro
                WHERE codice LIKE 'SC-' || TO_CHAR(NEW.data_inizio, 'YYMM') || '-%'
            ) AS TEXT), 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per generare il codice scheda
CREATE TRIGGER set_scheda_code
    BEFORE INSERT ON schede_lavoro
    FOR EACH ROW
    EXECUTE FUNCTION generate_scheda_code();

-- Enable RLS
ALTER TABLE schede_lavoro ENABLE ROW LEVEL SECURITY;
ALTER TABLE schede_lavoro_personale ENABLE ROW LEVEL SECURITY;
ALTER TABLE schede_lavoro_attrezzature ENABLE ROW LEVEL SECURITY;
ALTER TABLE schede_lavoro_mezzi ENABLE ROW LEVEL SECURITY;
ALTER TABLE schede_lavoro_imballi ENABLE ROW LEVEL SECURITY;

-- Add policies for public access
CREATE POLICY "Accesso pubblico in lettura schede_lavoro"
    ON schede_lavoro FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Accesso pubblico in scrittura schede_lavoro"
    ON schede_lavoro FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

CREATE POLICY "Accesso pubblico in lettura schede_lavoro_personale"
    ON schede_lavoro_personale FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Accesso pubblico in scrittura schede_lavoro_personale"
    ON schede_lavoro_personale FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

CREATE POLICY "Accesso pubblico in lettura schede_lavoro_attrezzature"
    ON schede_lavoro_attrezzature FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Accesso pubblico in scrittura schede_lavoro_attrezzature"
    ON schede_lavoro_attrezzature FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

CREATE POLICY "Accesso pubblico in lettura schede_lavoro_mezzi"
    ON schede_lavoro_mezzi FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Accesso pubblico in scrittura schede_lavoro_mezzi"
    ON schede_lavoro_mezzi FOR ALL TO PUBLIC USING (true) WITH CHECK (true);

CREATE POLICY "Accesso pubblico in lettura schede_lavoro_imballi"
    ON schede_lavoro_imballi FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Accesso pubblico in scrittura schede_lavoro_imballi"
    ON schede_lavoro_imballi FOR ALL TO PUBLIC USING (true) WITH CHECK (true);