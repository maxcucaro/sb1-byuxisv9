/*
  # Aggiunta generazione automatica codici

  1. Funzioni
    - Aggiunge funzioni per generare codici automatici per:
      - Clienti (CL-XXXX)
      - Fornitori (FO-XXXX)
      - CAT (CT-XXXX)
      - Produzioni (PR-XXXX)

  2. Trigger
    - Aggiunge trigger per generare automaticamente i codici prima dell'inserimento
*/

-- Funzione per clienti
CREATE OR REPLACE FUNCTION generate_cliente_code() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codice IS NULL OR NEW.codice = '' THEN
    NEW.codice := 'CL-' || LPAD(CAST((
      SELECT COALESCE(MAX(CAST(SUBSTRING(codice FROM 4) AS INTEGER)), 0) + 1
      FROM clienti
      WHERE codice LIKE 'CL-%'
    ) AS TEXT), 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funzione per fornitori
CREATE OR REPLACE FUNCTION generate_fornitore_code() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codice IS NULL OR NEW.codice = '' THEN
    NEW.codice := 'FO-' || LPAD(CAST((
      SELECT COALESCE(MAX(CAST(SUBSTRING(codice FROM 4) AS INTEGER)), 0) + 1
      FROM fornitori
      WHERE codice LIKE 'FO-%'
    ) AS TEXT), 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funzione per CAT
CREATE OR REPLACE FUNCTION generate_cat_code() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codice IS NULL OR NEW.codice = '' THEN
    NEW.codice := 'CT-' || LPAD(CAST((
      SELECT COALESCE(MAX(CAST(SUBSTRING(codice FROM 4) AS INTEGER)), 0) + 1
      FROM cat
      WHERE codice LIKE 'CT-%'
    ) AS TEXT), 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funzione per produzioni
CREATE OR REPLACE FUNCTION generate_produzione_code() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codice IS NULL OR NEW.codice = '' THEN
    NEW.codice := 'PR-' || LPAD(CAST((
      SELECT COALESCE(MAX(CAST(SUBSTRING(codice FROM 4) AS INTEGER)), 0) + 1
      FROM produzioni
      WHERE codice LIKE 'PR-%'
    ) AS TEXT), 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per clienti
CREATE TRIGGER set_cliente_code
  BEFORE INSERT ON clienti
  FOR EACH ROW
  EXECUTE FUNCTION generate_cliente_code();

-- Trigger per fornitori
CREATE TRIGGER set_fornitore_code
  BEFORE INSERT ON fornitori
  FOR EACH ROW
  EXECUTE FUNCTION generate_fornitore_code();

-- Trigger per CAT
CREATE TRIGGER set_cat_code
  BEFORE INSERT ON cat
  FOR EACH ROW
  EXECUTE FUNCTION generate_cat_code();

-- Trigger per produzioni
CREATE TRIGGER set_produzione_code
  BEFORE INSERT ON produzioni
  FOR EACH ROW
  EXECUTE FUNCTION generate_produzione_code();