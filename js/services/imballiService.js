import { supabase } from '../utils/supabaseClient.js';
import { handleError } from '../utils/errorHandling.js';

class ImballiService {
    async getImballi() {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('imballi')
                .select('*')
                .order('codice', { ascending: true });

            if (error) throw error;
            return { success: true, data };
        }, 'recupero imballi');
    }

    async addImballo(formData) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('imballi')
                .insert([formData])
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'inserimento imballo');
    }

    async updateImballo(id, formData) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('imballi')
                .update(formData)
                .eq('id', id)
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiornamento imballo');
    }

    async toggleStatoImballo(id, nuovoStato) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('imballi')
                .update({ attivo: nuovoStato })
                .eq('id', id)
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'modifica stato imballo');
    }
}

export const imballiService = new ImballiService();