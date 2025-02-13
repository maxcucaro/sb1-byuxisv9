import { supabase } from '../utils/supabaseClient.js';
import { handleError } from '../utils/errorHandling.js';

class MezziService {
    async getMezzi() {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('mezzi')
                .select('*')
                .order('codice', { ascending: true });

            if (error) throw error;
            return { success: true, data };
        }, 'recupero mezzi');
    }

    async addMezzo(formData) {
        return handleError(async () => {
            // Clean up numeric fields
            const cleanData = {
                ...formData,
                portata: formData.portata ? parseFloat(formData.portata) : null
            };

            const { data, error } = await supabase
                .from('mezzi')
                .insert([cleanData])
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'inserimento mezzo');
    }

    async updateMezzo(id, formData) {
        return handleError(async () => {
            // Clean up numeric fields
            const cleanData = {
                ...formData,
                portata: formData.portata ? parseFloat(formData.portata) : null
            };

            const { data, error } = await supabase
                .from('mezzi')
                .update(cleanData)
                .eq('id', id)
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiornamento mezzo');
    }

    async toggleStatoMezzo(id, nuovoStato) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('mezzi')
                .update({ attivo: nuovoStato })
                .eq('id', id)
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'modifica stato mezzo');
    }
}

export const mezziService = new MezziService();