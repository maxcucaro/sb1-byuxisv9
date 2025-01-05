/*
  # Add preparation columns to materiali_richiesti table

  1. Changes
    - Add quantita_preparata column to track prepared quantity
    - Add note_preparazione column for preparation notes
    - Add check constraint to ensure prepared quantity doesn't exceed requested quantity
*/

-- Add new columns
ALTER TABLE materiali_richiesti
ADD COLUMN quantita_preparata INTEGER,
ADD COLUMN note_preparazione TEXT;

-- Add check constraint
ALTER TABLE materiali_richiesti
ADD CONSTRAINT check_quantita_preparata 
CHECK (quantita_preparata IS NULL OR (quantita_preparata >= 0 AND quantita_preparata <= quantita));