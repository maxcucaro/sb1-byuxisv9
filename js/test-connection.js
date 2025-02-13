import { supabase, testConnection } from './utils/supabaseClient.js';

async function init() {
    try {
        const isConnected = await testConnection();
        if (isConnected) {
            console.log('✅ Connessione a Supabase riuscita!');
        } else {
            throw new Error('Test di connessione fallito');
        }
    } catch (error) {
        console.error('❌ Errore di connessione:', error.message);
    }
}

init();