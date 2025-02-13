-- Add preparation tracking fields
ALTER TABLE materiali_richiesti
ADD COLUMN stato_preparazione TEXT NOT NULL DEFAULT 'DA_PREPARARE',
ADD COLUMN operatore_id uuid REFERENCES team(id),
ADD COLUMN data_inizio_preparazione TIMESTAMPTZ,
ADD COLUMN data_fine_preparazione TIMESTAMPTZ;

-- Add check constraint for valid states
ALTER TABLE materiali_richiesti
ADD CONSTRAINT valid_prep_state 
CHECK (stato_preparazione IN ('DA_PREPARARE', 'IN_PREPARAZIONE', 'PRONTO'));

-- Add check for preparation dates
ALTER TABLE materiali_richiesti
ADD CONSTRAINT valid_prep_dates 
CHECK (data_fine_preparazione IS NULL OR data_fine_preparazione >= data_inizio_preparazione);