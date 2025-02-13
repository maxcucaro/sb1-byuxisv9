/*
  # Create Unified Inventory View

  1. New Views
    - `inventario_completo`: Vista che unisce tutti gli articoli di tutti i settori
    
  2. Changes
    - Crea una vista che unifica tutti gli articoli da tutte le tabelle settoriali
    - Include gli imballi nella vista
    - Standardizza i campi per tutti gli articoli
    
  3. Security
    - Abilita accesso pubblico in lettura alla vista
*/

-- Create view that combines all articles from all sectors
CREATE OR REPLACE VIEW inventario_completo AS
-- AUDIO
SELECT 
    cod,
    descrizione,
    'AUDIO' as settore,
    categoria,
    quantita,
    base,
    altezza,
    profondita,
    peso,
    ubicazione,
    attivo
FROM articoli_audio

UNION ALL

-- LUCI
SELECT 
    cod,
    descrizione,
    'LUCI' as settore,
    categoria,
    quantita,
    base,
    altezza,
    profondita,
    peso,
    ubicazione,
    attivo
FROM articoli_luci

UNION ALL

-- VIDEO
SELECT 
    cod,
    descrizione,
    'VIDEO' as settore,
    categoria,
    quantita,
    base,
    altezza,
    profondita,
    peso,
    ubicazione,
    attivo
FROM articoli_video

UNION ALL

-- ELETTRICO
SELECT 
    cod,
    descrizione,
    'ELETTRICO' as settore,
    categoria,
    quantita,
    base,
    altezza,
    profondita,
    peso,
    ubicazione,
    attivo
FROM articoli_elettrico

UNION ALL

-- BACKLINE
SELECT 
    cod,
    descrizione,
    'BACKLINE' as settore,
    categoria,
    quantita,
    base,
    altezza,
    profondita,
    peso,
    ubicazione,
    attivo
FROM articoli_backline

UNION ALL

-- IMBALLI
SELECT 
    codice as cod,
    descrizione,
    'IMBALLI' as settore,
    'IMBALLI' as categoria,
    1 as quantita,
    NULL as base,
    NULL as altezza,
    NULL as profondita,
    peso,
    NULL as ubicazione,
    attivo
FROM imballi;

-- Enable RLS
ALTER VIEW inventario_completo SET (security_invoker = true);

-- Add policy for public read access
CREATE POLICY "Accesso pubblico in lettura inventario_completo"
    ON inventario_completo
    FOR SELECT
    TO PUBLIC
    USING (true);

-- Create index to optimize queries
CREATE INDEX IF NOT EXISTS idx_inventario_cod ON inventario_completo(cod);
CREATE INDEX IF NOT EXISTS idx_inventario_settore ON inventario_completo(settore);
CREATE INDEX IF NOT EXISTS idx_inventario_categoria ON inventario_completo(categoria);