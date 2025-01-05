import { supabase } from '../utils/supabaseClient.js';
import { SETTORI } from '../utils/constants.js';

class InventoryService {
  async getInventoryByDate(date = null) {
    try {
      const settoriKeys = Object.keys(SETTORI);
      let results = {};

      for (const settore of settoriKeys) {
        const query = supabase
          .from(`articoli_${settore.toLowerCase()}`)
          .select('cod, descrizione, settore, categoria, quantita, ubicazione')
          .eq('attivo', true)
          .order('cod');

        if (date) {
          query.lte('created_at', date);
        }

        const { data, error } = await query;
        if (error) throw error;
        results[settore] = data || [];
      }

      return { success: true, data: results };
    } catch (error) {
      console.error('Errore durante il recupero dell\'inventario:', error);
      return { success: false, error: error.message };
    }
  }
}

export const inventoryService = new InventoryService();