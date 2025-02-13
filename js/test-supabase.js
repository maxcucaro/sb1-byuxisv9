import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Credenziali Supabase mancanti nel file .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('settori_categorie')
      .select('count')
      .limit(1);
      
    if (error) throw error;
    console.log('✅ Connessione a Supabase riuscita!');
  } catch (error) {
    console.error('❌ Errore di connessione:', error.message);
  }
}

testConnection();