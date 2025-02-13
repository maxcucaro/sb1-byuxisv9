/*
  # Update Complete Inventory View

  1. Changes
    - Aggiunge i settori mancanti alla vista inventario_completo
    - Include tutti i 12 settori del sistema
    
  2. Security
    - Mantiene le stesse policy di sicurezza
*/

-- Drop existing view and recreate with all sectors
DROP VIEW IF EXISTS inventario_completo CASCADE;

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

-- SEGNALI
SELECT 
    cod,
    descrizione,
    'SEGNALI' as settore,
    categoria,
    quantita,
    base,
    altezza,
    profondita,
    peso,
    ubicazione,
    attivo
FROM articoli_segnali

UNION ALL

-- STRUTTURE
SELECT 
    cod,
    descrizione,
    'STRUTTURE' as settore,
    categoria,
    quantita,
    base,
    altezza,
    profondita,
    peso,
    ubicazione,
    attivo
FROM articoli_strutture

UNION ALL

-- ALLESTIMENTO
SELECT 
    cod,
    descrizione,
    'ALLESTIMENTO' as settore,
    categoria,
    quantita,
    base,
    altezza,
    profondita,
    peso,
    ubicazione,
    attivo
FROM articoli_allestimento

UNION ALL

-- ATTREZZATURE
SELECT 
    cod,
    descrizione,
    'ATTREZZATURE' as settore,
    categoria,
    quantita,
    base,
    altezza,
    profondita,
    peso,
    ubicazione,
    attivo
FROM articoli_attrezzature

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

-- RIGGHERAGGIO
SELECT 
    cod,
    descrizione,
    'RIGGHERAGGIO' as settore,
    categoria,
    quantita,
    base,
    altezza,
    profondita,
    peso,
    ubicazione,
    attivo
FROM articoli_riggheraggio

UNION ALL

-- GENERICO
SELECT 
    cod,
    descrizione,
    'GENERICO' as settore,
    categoria,
    quantita,
    base,
    altezza,
    profondita,
    peso,
    ubicazione,
    attivo
FROM articoli_generico

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