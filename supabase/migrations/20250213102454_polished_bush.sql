-- Add preparation and return date columns to schede_lavoro
ALTER TABLE schede_lavoro
ADD COLUMN data_inizio_preparazione DATE,
ADD COLUMN data_rientro_lavoro DATE;

-- Add check constraint to ensure dates are valid
ALTER TABLE schede_lavoro
ADD CONSTRAINT check_date_preparazione 
CHECK (data_inizio_preparazione IS NULL OR data_inizio_preparazione <= data_inizio),
ADD CONSTRAINT check_date_rientro 
CHECK (data_rientro_lavoro IS NULL OR data_rientro_lavoro >= data_fine);

-- Add comment
COMMENT ON COLUMN schede_lavoro.data_inizio_preparazione IS 'Data di inizio preparazione materiali';
COMMENT ON COLUMN schede_lavoro.data_rientro_lavoro IS 'Data prevista di rientro materiali';