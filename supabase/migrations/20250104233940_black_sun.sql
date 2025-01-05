-- Add columns for tracking returned and damaged items
ALTER TABLE materiali_richiesti
ADD COLUMN quantita_rientrata INTEGER DEFAULT 0,
ADD COLUMN quantita_danneggiata INTEGER DEFAULT 0;

-- Add check constraints
ALTER TABLE materiali_richiesti
ADD CONSTRAINT check_quantita_rientrata 
CHECK (quantita_rientrata >= 0 AND quantita_rientrata <= quantita),
ADD CONSTRAINT check_quantita_danneggiata 
CHECK (quantita_danneggiata >= 0 AND quantita_danneggiata <= quantita);