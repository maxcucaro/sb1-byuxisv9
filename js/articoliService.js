import { supabase } from './utils/supabaseClient.js';

export async function getArticoli(settore) {
  try {
    const { data, error } = await supabase
      .from(`articoli_${settore.toLowerCase()}`)
      .select('*')
      .order('cod', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error(`Errore durante il recupero degli articoli ${settore}:`, error);
    return { success: false, error: error.message };
  }
}

export async function insertArticolo(settore, formData) {
  try {
    const { data, error } = await supabase
      .from(`articoli_${settore.toLowerCase()}`)
      .insert([formData])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error(`Errore durante l'inserimento dell'articolo ${settore}:`, error);
    return { success: false, error: error.message };
  }
}