-- Add movement type enum
CREATE TYPE tipo_movimento AS ENUM ('IN', 'OUT', 'TRASFERIMENTO', 'RETTIFICA', 'NOLEGGIO');

-- Add movement status enum
CREATE TYPE stato_movimento AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- Add columns to inventario_movimenti
ALTER TABLE inventario_movimenti
ADD COLUMN tipo tipo_movimento NOT NULL,
ADD COLUMN stato stato_movimento NOT NULL DEFAULT 'PENDING',
ADD COLUMN data_movimento TIMESTAMPTZ NOT NULL DEFAULT now(),
ADD COLUMN data_completamento TIMESTAMPTZ,
ADD COLUMN ubicazione_origine TEXT,
ADD COLUMN ubicazione_destinazione TEXT,
ADD COLUMN ddt_numero TEXT,
ADD COLUMN ddt_data DATE,
ADD COLUMN fornitore_id uuid REFERENCES fornitori(id),
ADD COLUMN cliente_id uuid REFERENCES clienti(id),
ADD COLUMN prezzo DECIMAL(10,2),
ADD COLUMN data_inizio_noleggio DATE,
ADD COLUMN data_fine_noleggio DATE;

-- Add check constraints
ALTER TABLE inventario_movimenti
ADD CONSTRAINT check_movimento_date 
CHECK (data_completamento IS NULL OR data_completamento >= data_movimento),
ADD CONSTRAINT check_noleggio_date 
CHECK (data_fine_noleggio IS NULL OR data_fine_noleggio >= data_inizio_noleggio);

-- Add function to create movement
CREATE OR REPLACE FUNCTION crea_movimento_inventario(
    p_settore TEXT,
    p_articolo_cod TEXT,
    p_tipo tipo_movimento,
    p_quantita INTEGER,
    p_scheda_id UUID DEFAULT NULL,
    p_operatore_id UUID DEFAULT NULL,
    p_note TEXT DEFAULT NULL,
    p_ubicazione_origine TEXT DEFAULT NULL,
    p_ubicazione_destinazione TEXT DEFAULT NULL,
    p_ddt_numero TEXT DEFAULT NULL,
    p_ddt_data DATE DEFAULT NULL,
    p_fornitore_id UUID DEFAULT NULL,
    p_cliente_id UUID DEFAULT NULL,
    p_prezzo DECIMAL(10,2) DEFAULT NULL,
    p_data_inizio_noleggio DATE DEFAULT NULL,
    p_data_fine_noleggio DATE DEFAULT NULL
) RETURNS inventario_movimenti AS $$
DECLARE
    v_movimento inventario_movimenti;
    v_giacenza INTEGER;
BEGIN
    -- Validate quantity
    IF p_quantita <= 0 THEN
        RAISE EXCEPTION 'La quantità deve essere maggiore di zero';
    END IF;

    -- Get current stock
    EXECUTE format(
        'SELECT quantita FROM articoli_%I WHERE cod = $1',
        lower(p_settore)
    ) INTO v_giacenza USING p_articolo_cod;

    -- Validate stock for outgoing movements
    IF p_tipo IN ('OUT', 'TRASFERIMENTO', 'NOLEGGIO') AND v_giacenza < p_quantita THEN
        RAISE EXCEPTION 'Giacenza insufficiente';
    END IF;

    -- Create movement record
    INSERT INTO inventario_movimenti (
        settore,
        articolo_cod,
        tipo,
        quantita,
        scheda_id,
        operatore_id,
        note,
        ubicazione_origine,
        ubicazione_destinazione,
        ddt_numero,
        ddt_data,
        fornitore_id,
        cliente_id,
        prezzo,
        data_inizio_noleggio,
        data_fine_noleggio
    ) VALUES (
        p_settore,
        p_articolo_cod,
        p_tipo,
        p_quantita,
        p_scheda_id,
        p_operatore_id,
        p_note,
        p_ubicazione_origine,
        p_ubicazione_destinazione,
        p_ddt_numero,
        p_ddt_data,
        p_fornitore_id,
        p_cliente_id,
        p_prezzo,
        p_data_inizio_noleggio,
        p_data_fine_noleggio
    ) RETURNING * INTO v_movimento;

    -- Update stock based on movement type
    IF p_tipo = 'IN' THEN
        EXECUTE format(
            'UPDATE articoli_%I SET quantita = quantita + $1 WHERE cod = $2',
            lower(p_settore)
        ) USING p_quantita, p_articolo_cod;
    ELSIF p_tipo IN ('OUT', 'NOLEGGIO') THEN
        EXECUTE format(
            'UPDATE articoli_%I SET quantita = quantita - $1 WHERE cod = $2',
            lower(p_settore)
        ) USING p_quantita, p_articolo_cod;
    END IF;

    RETURN v_movimento;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to complete movement
CREATE OR REPLACE FUNCTION completa_movimento_inventario(
    p_movimento_id UUID,
    p_note TEXT DEFAULT NULL
) RETURNS inventario_movimenti AS $$
DECLARE
    v_movimento inventario_movimenti;
BEGIN
    -- Get and validate movement
    SELECT * INTO v_movimento
    FROM inventario_movimenti
    WHERE id = p_movimento_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Movimento non trovato';
    END IF;

    IF v_movimento.stato != 'PENDING' THEN
        RAISE EXCEPTION 'Il movimento non è in stato PENDING';
    END IF;

    -- Update movement
    UPDATE inventario_movimenti SET
        stato = 'COMPLETED',
        data_completamento = now(),
        note = COALESCE(p_note, note)
    WHERE id = p_movimento_id
    RETURNING * INTO v_movimento;

    RETURN v_movimento;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to cancel movement
CREATE OR REPLACE FUNCTION annulla_movimento_inventario(
    p_movimento_id UUID,
    p_note TEXT DEFAULT NULL
) RETURNS inventario_movimenti AS $$
DECLARE
    v_movimento inventario_movimenti;
BEGIN
    -- Get and validate movement
    SELECT * INTO v_movimento
    FROM inventario_movimenti
    WHERE id = p_movimento_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Movimento non trovato';
    END IF;

    IF v_movimento.stato != 'PENDING' THEN
        RAISE EXCEPTION 'Il movimento non è in stato PENDING';
    END IF;

    -- Update movement
    UPDATE inventario_movimenti SET
        stato = 'CANCELLED',
        data_completamento = now(),
        note = COALESCE(p_note, note)
    WHERE id = p_movimento_id
    RETURNING * INTO v_movimento;

    -- Revert stock changes if any were made
    IF v_movimento.tipo = 'IN' THEN
        EXECUTE format(
            'UPDATE articoli_%I SET quantita = quantita - $1 WHERE cod = $2',
            lower(v_movimento.settore)
        ) USING v_movimento.quantita, v_movimento.articolo_cod;
    ELSIF v_movimento.tipo IN ('OUT', 'NOLEGGIO') THEN
        EXECUTE format(
            'UPDATE articoli_%I SET quantita = quantita + $1 WHERE cod = $2',
            lower(v_movimento.settore)
        ) USING v_movimento.quantita, v_movimento.articolo_cod;
    END IF;

    RETURN v_movimento;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_movimenti_data 
ON inventario_movimenti(data_movimento);

CREATE INDEX IF NOT EXISTS idx_movimenti_stato 
ON inventario_movimenti(stato);

CREATE INDEX IF NOT EXISTS idx_movimenti_tipo 
ON inventario_movimenti(tipo);

-- Grant permissions
GRANT EXECUTE ON FUNCTION crea_movimento_inventario TO PUBLIC;
GRANT EXECUTE ON FUNCTION completa_movimento_inventario TO PUBLIC;
GRANT EXECUTE ON FUNCTION annulla_movimento_inventario TO PUBLIC;

-- Add comments
COMMENT ON TABLE inventario_movimenti IS 'Tracciamento movimentazioni inventario';
COMMENT ON COLUMN inventario_movimenti.tipo IS 'Tipo di movimento: IN (carico), OUT (scarico), TRASFERIMENTO, RETTIFICA, NOLEGGIO';
COMMENT ON COLUMN inventario_movimenti.stato IS 'Stato del movimento: PENDING, COMPLETED, CANCELLED';