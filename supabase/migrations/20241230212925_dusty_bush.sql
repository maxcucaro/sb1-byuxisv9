/*
  # Update RLS policies for all sector tables

  1. Changes
    - Remove existing restrictive RLS policies
    - Add public access policies for all sector tables
    - Maintain consistency with backline table policies
  
  2. Security
    - Enable public access for development/testing
    - Note: In production, these should be restricted to authenticated users
*/

-- Drop existing policies first
DROP POLICY IF EXISTS "Utenti autenticati possono leggere articoli audio" ON articoli_audio;
DROP POLICY IF EXISTS "Utenti autenticati possono gestire articoli audio" ON articoli_audio;
DROP POLICY IF EXISTS "Utenti autenticati possono leggere articoli luci" ON articoli_luci;
DROP POLICY IF EXISTS "Utenti autenticati possono gestire articoli luci" ON articoli_luci;
DROP POLICY IF EXISTS "Utenti autenticati possono leggere articoli video" ON articoli_video;
DROP POLICY IF EXISTS "Utenti autenticati possono gestire articoli video" ON articoli_video;
DROP POLICY IF EXISTS "Utenti autenticati possono leggere articoli elettrico" ON articoli_elettrico;
DROP POLICY IF EXISTS "Utenti autenticati possono gestire articoli elettrico" ON articoli_elettrico;

-- AUDIO
ALTER TABLE articoli_audio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accesso pubblico in lettura articoli audio"
  ON articoli_audio
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Accesso pubblico in scrittura articoli audio"
  ON articoli_audio
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

-- LUCI
ALTER TABLE articoli_luci ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accesso pubblico in lettura articoli luci"
  ON articoli_luci
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Accesso pubblico in scrittura articoli luci"
  ON articoli_luci
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

-- VIDEO
ALTER TABLE articoli_video ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accesso pubblico in lettura articoli video"
  ON articoli_video
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Accesso pubblico in scrittura articoli video"
  ON articoli_video
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

-- ELETTRICO
ALTER TABLE articoli_elettrico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accesso pubblico in lettura articoli elettrico"
  ON articoli_elettrico
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Accesso pubblico in scrittura articoli elettrico"
  ON articoli_elettrico
  FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);