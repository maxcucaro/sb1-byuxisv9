import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// Credenziali di test (sostituire con quelle definitive in produzione)
const supabaseUrl = 'https://idewdhvmcyhpgvpmkefd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkZXdkaHZtY3locGd2cG1rZWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1ODgxNDMsImV4cCI6MjA1MTE2NDE0M30.RAIBKUjHAbx_a5_KUvs-Loc2hNd6SU6etOEczz4-moQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function testConnection() {
    try {
        const { error } = await supabase.from('articoli_backline').select('count').limit(1);
        return !error;
    } catch (error) {
        console.error('Errore di connessione a Supabase:', error);
        return false;
    }
}