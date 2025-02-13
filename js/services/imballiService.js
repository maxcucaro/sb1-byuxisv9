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

    async getNextCode() {
        const { data, error } = await supabase
            .from('imballi')
            .select('codice')
            .like('codice', 'IB-%')
            .order('codice', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (!data || data.length === 0) {
            return 'IB-0001';
        }

        const lastCode = data[0].codice;
        const lastNumber = parseInt(lastCode.split('-')[1]);
        return `IB-${String(lastNumber + 1).padStart(4, '0')}`;
    }

    async addImballo(formData) {
        return handleError(async () => {
            const codice = await this.getNextCode();
            
            const { data, error } = await supabase
                .from('imballi')
                .insert([{
                    ...formData,
                    codice
                }])
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

    async deleteImballo(id) {
        return handleError(async () => {
            const { error } = await supabase
                .from('imballi')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        }, 'eliminazione imballo');
    }
}

export const imballiService = new ImballiService();