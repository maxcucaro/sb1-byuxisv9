-- Funzione per popolare i movimenti inventario dalle schede esistenti
CREATE OR REPLACE FUNCTION popola_movimenti_inventario()
RETURNS void AS $$
DECLARE
    r RECORD;
BEGIN
    -- Inserisci movimenti per i materiali richiesti
    FOR r IN (
        SELECT 
            mr.id as materiale_id,
            mr.scheda_id,
            mr.settore,
            mr.articolo_cod,
            mr.quantita,
            mr.stato as stato_materiale,
            mr.note,
            mr.data_inizio_preparazione,
            mr.data_fine_preparazione,
            sl.data_inizio,
            sl.data_fine,
            sl.stato as stato_scheda,
            sl.responsabile_id
        FROM materiali_richiesti mr
        JOIN schede_lavoro sl ON mr.scheda_id = sl.id
        WHERE sl.stato NOT IN ('BOZZA', 'ANNULLATA')
    ) LOOP
        -- Crea movimento OUT per materiali usciti
        IF r.stato_materiale IN ('OUT', 'IMPEGNATO') THEN
            INSERT INTO inventario_movimenti (
                settore,
                articolo_cod,
                tipo,
                quantita,
                scheda_id,
                operatore_id,
                note,
                data_movimento,
                stato,
                data_completamento
            ) VALUES (
                r.settore,
                r.articolo_cod,
                'OUT',
                r.quantita,
                r.scheda_id,
                r.responsabile_id,
                r.note,
                COALESCE(r.data_inizio_preparazione, r.data_inizio),
                CASE 
                    WHEN r.stato_materiale = 'OUT' THEN 'COMPLETED'
                    ELSE 'PENDING'
                END,
                CASE 
                    WHEN r.stato_materiale = 'OUT' THEN r.data_fine_preparazione
                    ELSE NULL
                END
            );
        END IF;

        -- Crea movimento IN per materiali rientrati
        IF r.stato_materiale = 'RIENTRATO' THEN
            INSERT INTO inventario_movimenti (
                settore,
                articolo_cod,
                tipo,
                quantita,
                scheda_id,
                operatore_id,
                note,
                data_movimento,
                stato,
                data_completamento
            ) VALUES (
                r.settore,
                r.articolo_cod,
                'IN',
                r.quantita,
                r.scheda_id,
                r.responsabile_id,
                'Rientro da scheda lavoro ' || r.scheda_id,
                r.data_fine,
                'COMPLETED',
                r.data_fine
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Esegui la funzione per popolare i movimenti
SELECT popola_movimenti_inventario();

-- Elimina la funzione dopo l'uso
DROP FUNCTION popola_movimenti_inventario();