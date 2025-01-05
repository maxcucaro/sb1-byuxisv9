/*
  # Create settori_categorie table

  1. New Tables
    - `settori_categorie`
      - `id` (serial, primary key)
      - `settore` (text, not null)
      - `categoria` (text, not null)
      - `attivo` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add public access policies
*/

CREATE TABLE settori_categorie (
    id SERIAL PRIMARY KEY,
    settore TEXT NOT NULL,
    categoria TEXT NOT NULL,
    attivo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(settore, categoria)
);

-- Enable RLS
ALTER TABLE settori_categorie ENABLE ROW LEVEL SECURITY;

-- Add policies for public access
CREATE POLICY "Accesso pubblico in lettura settori_categorie"
    ON settori_categorie
    FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Accesso pubblico in scrittura settori_categorie"
    ON settori_categorie
    FOR ALL
    TO PUBLIC
    USING (true)
    WITH CHECK (true);

-- Add trigger for updating timestamp
CREATE TRIGGER update_settori_categorie_timestamp
    BEFORE UPDATE ON settori_categorie
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Insert default categories from SETTORI constant
INSERT INTO settori_categorie (settore, categoria) VALUES
    -- AUDIO
    ('AUDIO', 'P.A. - MONITOR - FRONT FIIL'),
    ('AUDIO', 'BANCHI AUDIO E STAGEBOX'),
    ('AUDIO', 'INTERCOM / ASCOLTO CUFFIA'),
    ('AUDIO', 'MICROFONO DINAMICO'),
    ('AUDIO', 'MICROFONO CONDENSATORE'),
    ('AUDIO', 'MICROFONO OMNI'),
    ('AUDIO', 'MIC RF RX'),
    ('AUDIO', 'MIC RF TX'),
    ('AUDIO', 'MIC RF CAPSULA'),
    ('AUDIO', 'MIC RF ANTENNA'),
    ('AUDIO', 'MIC RF ARCHETTO'),
    ('AUDIO', 'MIC RF CARDIOIDE'),
    ('AUDIO', 'D.I BOX'),
    ('AUDIO', 'ASTE E STATIVI'),
    ('AUDIO', 'CAVI AUDIO'),
    ('AUDIO', 'CAVI XLR MULTICANALE'),
    ('AUDIO', 'BACKLINE'),

    -- LUCI
    ('LUCI', 'BANCHI'),
    ('LUCI', 'BANCHI / SPLITTER / NODO ARTNET / WIFI'),
    ('LUCI', 'PROIETTORI CONVENZIONALI'),
    ('LUCI', 'PROIETTORI MOTORIZZATI'),
    ('LUCI', 'PROIETTORI LED'),
    ('LUCI', 'PROIETTORI LED BATTERIA'),
    ('LUCI', 'SEGUIPERSONA'),
    ('LUCI', 'SMOKE MACHINE E ACCESSORI'),
    ('LUCI', 'STATIVI E WINDUP'),
    ('LUCI', 'CAVI DMX E ACCESSORI'),
    ('LUCI', 'LASER E MACCHINE SPECIALI'),

    -- VIDEO
    ('VIDEO', 'MONITOR CAVI HDMI ACCESSORI VIDEO'),
    ('VIDEO', 'MEDIASERVER / PC'),
    ('VIDEO', 'VIDEO CONTROLLER'),
    ('VIDEO', 'PROIETTORI E ACCESSORI'),
    ('VIDEO', 'LEDWALL'),

    -- ELETTRICO
    ('ELETTRICO', 'POWERBOX'),
    ('ELETTRICO', 'CAVERIA 380 VOLT'),
    ('ELETTRICO', 'CAVERIA 220 VOLT'),
    ('ELETTRICO', 'CIABATTE E ADATTATORI'),

    -- STRUTTURE
    ('STRUTTURE', 'STRUTTURE E BASI'),
    ('STRUTTURE', 'ACCESSORI TRUSS'),
    ('STRUTTURE', 'TORRI E SISTEMI DI SOLLEVAMENTO'),

    -- SEGNALI
    ('SEGNALI', 'ROUTER / SWITCH / CAVI DI RETE'),
    ('SEGNALI', 'CAVI RETE'),
    ('SEGNALI', 'COVERTER RETE'),

    -- ALLESTIMENTO
    ('ALLESTIMENTO', 'PEDANE E ACCESSORI'),
    ('ALLESTIMENTO', 'MOQUETTE E TNT'),
    ('ALLESTIMENTO', 'COPERTURA'),

    -- ATTREZZATURE
    ('ATTREZZATURE', 'UTENSILI'),
    ('ATTREZZATURE', 'SCALE'),
    ('ATTREZZATURE', 'CARRELLI'),
    ('ATTREZZATURE', 'ACCESSORI'),

    -- BACKLINE
    ('BACKLINE', 'AMPLIFICATORI'),
    ('BACKLINE', 'BATTERIE'),
    ('BACKLINE', 'CHITARRE'),
    ('BACKLINE', 'TASTIERE'),
    ('BACKLINE', 'PERCUSSIONI'),
    ('BACKLINE', 'ACCESSORI'),
    ('BACKLINE', 'LEGGII'),
    ('BACKLINE', 'SUPPORTI'),

    -- RIGGHERAGGIO
    ('RIGGHERAGGIO', 'MOTORI'),
    ('RIGGHERAGGIO', 'PARANCHI'),
    ('RIGGHERAGGIO', 'ALISCAFF'),
    ('RIGGHERAGGIO', 'GANCI'),
    ('RIGGHERAGGIO', 'STEEL'),
    ('RIGGHERAGGIO', 'SPANSET'),
    ('RIGGHERAGGIO', 'ACCESSORI'),

    -- GENERICO
    ('GENERICO', 'RIGGHERAGGIO'),
    ('GENERICO', 'PEDANE E ACCESSORI'),
    ('GENERICO', 'MOQUETTE E TNT'),
    ('GENERICO', 'COPERTURA'),
    ('GENERICO', 'VARIE');