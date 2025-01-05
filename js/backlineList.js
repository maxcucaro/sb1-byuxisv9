import { supabase } from './utils/supabaseClient.js';

export async function getBacklineArticoli() {
  try {
    console.log('Recupero articoli backline...');
    const { data, error } = await supabase
      .from('articoli_backline')
      .select('*')
      .order('cod', { ascending: true });

    if (error) {
      console.error('Errore Supabase:', error);
      throw error;
    }
    
    console.log('Articoli backline recuperati:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Errore completo:', error);
    return { success: false, error: error.message };
  }
}