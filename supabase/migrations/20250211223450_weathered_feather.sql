/*
  # Create Unified Inventory Table

  1. New Table
    - `inventario_completo`: Tabella fisica che unisce tutti gli articoli di tutti i settori
    
  2. Changes
    - Crea una tabella che unifica tutti gli articoli da tutte le tabelle settoriali
    - Include gli imballi nella tabella
    - Standardizza i campi per tutti gli articoli
    - Aggiunge indici per ottimizzare le query
    
  3. Security
    - Abilita RLS
    - Aggiunge policy per accesso pubblico in lettura
*/

-- Create physical table for complete inventory
CREATE TABLE inventario_completo (
    id SERIAL PRIMARY KEY,
    cod TEXT NOT NULL,
    descrizione TEXT NOT NULL,
    settore TEXT NOT NULL,
    categoria TEXT NOT NULL,
    quantita INTEGER NOT NULL DEFAULT 0,
    base DECIMAL(10,2),
    altezza DECIMAL(10,2),
    profondita DECIMAL(10,2),
    peso DECIMAL(10,2),
    ubicazione TEXT,
    attivo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(settore, cod)
);

-- Enable RLS
ALTER TABLE inventario_completo ENABLE ROW LEVEL SECURITY;

-- Add policy for public read access
CREATE POLICY "Accesso pubblico in lettura inventario_completo"
    ON inventario_completo
    FOR SELECT
    TO PUBLIC
    USING (true);

-- Create indexes to optimize queries
CREATE INDEX idx_inventario_cod ON inventario_completo(cod);
CREATE INDEX idx_inventario_settore ON inventario_completo(settore);
CREATE INDEX idx_inventario_categoria ON inventario_completo(categoria);

-- Create function to populate inventory
CREATE OR REPLACE FUNCTION populate_inventario_completo()
RETURNS void AS $$
BEGIN
    -- Clear existing data
    TRUNCATE TABLE inventario_completo;
    
    -- Insert from AUDIO
    INSERT INTO inventario_completo (cod, descrizione, settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo)
    SELECT cod, descrizione, 'AUDIO', categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_audio;

    -- Insert from LUCI
    INSERT INTO inventario_completo (cod, descrizione, settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo)
    SELECT cod, descrizione, 'LUCI', categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_luci;

    -- Insert from VIDEO
    INSERT INTO inventario_completo (cod, descrizione, settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo)
    SELECT cod, descrizione, 'VIDEO', categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_video;

    -- Insert from ELETTRICO
    INSERT INTO inventario_completo (cod, descrizione, settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo)
    SELECT cod, descrizione, 'ELETTRICO', categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_elettrico;

    -- Insert from BACKLINE
    INSERT INTO inventario_completo (cod, descrizione, settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo)
    SELECT cod, descrizione, 'BACKLINE', categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_backline;

    -- Insert from IMBALLI
    INSERT INTO inventario_completo (cod, descrizione, settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo)
    SELECT codice, descrizione, 'IMBALLI', 'IMBALLI', 1, NULL, NULL, NULL, peso, NULL, attivo
    FROM imballi;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to keep inventory updated
CREATE OR REPLACE FUNCTION update_inventario_completo()
RETURNS TRIGGER AS $$
BEGIN
    -- Refresh the entire inventory
    PERFORM populate_inventario_completo();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each source table
DO $$ 
BEGIN
    -- Create trigger for AUDIO
    CREATE TRIGGER update_inventario_audio
    AFTER INSERT OR UPDATE OR DELETE ON articoli_audio
    FOR EACH STATEMENT
    EXECUTE FUNCTION update_inventario_completo();

    -- Create trigger for LUCI
    CREATE TRIGGER update_inventario_luci
    AFTER INSERT OR UPDATE OR DELETE ON articoli_luci
    FOR EACH STATEMENT
    EXECUTE FUNCTION update_inventario_completo();

    -- Create trigger for VIDEO
    CREATE TRIGGER update_inventario_video
    AFTER INSERT OR UPDATE OR DELETE ON articoli_video
    FOR EACH STATEMENT
    EXECUTE FUNCTION update_inventario_completo();

    -- Create trigger for ELETTRICO
    CREATE TRIGGER update_inventario_elettrico
    AFTER INSERT OR UPDATE OR DELETE ON articoli_elettrico
    FOR EACH STATEMENT
    EXECUTE FUNCTION update_inventario_completo();

    -- Create trigger for BACKLINE
    CREATE TRIGGER update_inventario_backline
    AFTER INSERT OR UPDATE OR DELETE ON articoli_backline
    FOR EACH STATEMENT
    EXECUTE FUNCTION update_inventario_completo();

    -- Create trigger for IMBALLI
    CREATE TRIGGER update_inventario_imballi
    AFTER INSERT OR UPDATE OR DELETE ON imballi
    FOR EACH STATEMENT
    EXECUTE FUNCTION update_inventario_completo();
END $$;

-- Initial population of the inventory
SELECT populate_inventario_completo();