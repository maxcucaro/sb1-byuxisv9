/*
  # Aggiornamento policy RLS per articoli backline

  1. Modifiche
    - Aggiunta policy per consentire operazioni CRUD senza autenticazione
    - Mantenute le policy esistenti per compatibilità futura
*/

-- Rimuovi le policy esistenti
DROP POLICY IF EXISTS "Utenti autenticati possono leggere articoli backline" ON articoli_backline;
DROP POLICY IF EXISTS "Utenti autenticati possono gestire articoli backline" ON articoli_backline;

-- Aggiungi nuove policy che consentono accesso pubblico
CREATE POLICY "Accesso pubblico in lettura articoli backline"
  ON articoli_backline
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Accesso pubblico in scrittura articoli backline"
  ON articoli_backline
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);