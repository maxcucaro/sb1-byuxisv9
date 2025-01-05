-- Aggiungi campi per tipo lavoro e riferimenti
ALTER TABLE schede_lavoro
ADD COLUMN tipo_lavoro TEXT REFERENCES tipologie_lavoro(tipo),
ADD COLUMN cliente_id uuid REFERENCES clienti(id),
ADD COLUMN cat_id uuid REFERENCES cat(id),
ADD COLUMN fornitore_id uuid REFERENCES fornitori(id);

-- Aggiorna i record esistenti impostando tipo_lavoro = 'INTERNO'
UPDATE schede_lavoro SET tipo_lavoro = 'INTERNO' WHERE tipo_lavoro IS NULL;