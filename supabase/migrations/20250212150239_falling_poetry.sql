-- Drop existing view
DROP VIEW IF EXISTS inventario_completo CASCADE;

-- Recreate view with correct kit quantity calculation
CREATE OR REPLACE VIEW inventario_completo AS
WITH articoli AS (
    -- AUDIO
    SELECT cod, descrizione, 'AUDIO' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_audio
    UNION ALL
    -- LUCI
    SELECT cod, descrizione, 'LUCI' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_luci
    UNION ALL
    -- VIDEO
    SELECT cod, descrizione, 'VIDEO' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_video
    UNION ALL
    -- ELETTRICO
    SELECT cod, descrizione, 'ELETTRICO' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_elettrico
    UNION ALL
    -- SEGNALI
    SELECT cod, descrizione, 'SEGNALI' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_segnali
    UNION ALL
    -- STRUTTURE
    SELECT cod, descrizione, 'STRUTTURE' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_strutture
    UNION ALL
    -- ALLESTIMENTO
    SELECT cod, descrizione, 'ALLESTIMENTO' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_allestimento
    UNION ALL
    -- ATTREZZATURE
    SELECT cod, descrizione, 'ATTREZZATURE' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_attrezzature
    UNION ALL
    -- BACKLINE
    SELECT cod, descrizione, 'BACKLINE' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_backline
    UNION ALL
    -- RIGGHERAGGIO
    SELECT cod, descrizione, 'RIGGHERAGGIO' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_riggheraggio
    UNION ALL
    -- GENERICO
    SELECT cod, descrizione, 'GENERICO' as settore, categoria, quantita, base, altezza, profondita, peso, ubicazione, attivo
    FROM articoli_generico
)
SELECT 
    a.*,
    COALESCE(kit_usage.quantita_in_kit, 0) as quantita_in_kit,
    (a.quantita - COALESCE(kit_usage.quantita_in_kit, 0)) as quantita_disponibile
FROM articoli a
LEFT JOIN (
    SELECT 
        kc.componente_settore as settore,
        kc.componente_cod as cod,
        SUM(kc.quantita * ka.quantita_kit) as quantita_in_kit
    FROM kit_componenti kc
    JOIN kit_articoli ka ON kc.kit_id = ka.id
    WHERE ka.attivo = true
    GROUP BY kc.componente_settore, kc.componente_cod
) kit_usage ON a.settore = kit_usage.settore AND a.cod = kit_usage.cod
WHERE a.attivo = true
ORDER BY a.settore, a.categoria, a.descrizione;

-- Add comment
COMMENT ON VIEW inventario_completo IS 'Vista unificata dell''inventario con calcolo corretto delle quantità in kit';