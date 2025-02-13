import { supabase } from '../utils/supabaseClient.js';
import { handleError } from '../utils/errorHandling.js';

class SchedaLavoroComponentiService {
    // Personale
    async getPersonaleScheda(schedaId) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('schede_lavoro_personale')
                .select(`
                    *,
                    dipendente:team(nome, cognome)
                `)
                .eq('scheda_id', schedaId)
                .order('data_inizio');

            if (error) throw error;
            return { success: true, data };
        }, 'recupero personale scheda');
    }

    async addPersonaleScheda(schedaId, formData) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('schede_lavoro_personale')
                .insert([{ ...formData, scheda_id: schedaId }])
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiunta personale scheda');
    }

    async removePersonaleScheda(id) {
        return handleError(async () => {
            const { error } = await supabase
                .from('schede_lavoro_personale')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        }, 'rimozione personale scheda');
    }

    // Attrezzature
    async getAttrezzatureScheda(schedaId) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('schede_lavoro_attrezzature')
                .select('*')
                .eq('scheda_id', schedaId)
                .order('settore');

            if (error) throw error;
            return { success: true, data };
        }, 'recupero attrezzature scheda');
    }

    async addAttrezzaturaScheda(schedaId, formData) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('schede_lavoro_attrezzature')
                .insert([{ ...formData, scheda_id: schedaId }])
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiunta attrezzatura scheda');
    }

    async removeAttrezzaturaScheda(id) {
        return handleError(async () => {
            const { error } = await supabase
                .from('schede_lavoro_attrezzature')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        }, 'rimozione attrezzatura scheda');
    }

    // Mezzi
    async getMezziScheda(schedaId) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('schede_lavoro_mezzi')
                .select(`
                    *,
                    mezzo:mezzi(tipo, marca, modello, targa)
                `)
                .eq('scheda_id', schedaId)
                .order('data_inizio');

            if (error) throw error;
            return { success: true, data };
        }, 'recupero mezzi scheda');
    }

    async addMezzoScheda(schedaId, formData) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('schede_lavoro_mezzi')
                .insert([{ ...formData, scheda_id: schedaId }])
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiunta mezzo scheda');
    }

    async removeMezzoScheda(id) {
        return handleError(async () => {
            const { error } = await supabase
                .from('schede_lavoro_mezzi')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        }, 'rimozione mezzo scheda');
    }

    // Imballi
    async getImballiScheda(schedaId) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('schede_lavoro_imballi')
                .select(`
                    *,
                    imballo:imballi(codice, descrizione)
                `)
                .eq('scheda_id', schedaId)
                .order('created_at');

            if (error) throw error;
            return { success: true, data };
        }, 'recupero imballi scheda');
    }

    async addImballoScheda(schedaId, formData) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('schede_lavoro_imballi')
                .insert([{ ...formData, scheda_id: schedaId }])
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiunta imballo scheda');
    }

    async removeImballoScheda(id) {
        return handleError(async () => {
            const { error } = await supabase
                .from('schede_lavoro_imballi')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        }, 'rimozione imballo scheda');
    }
}

export const schedaLavoroComponentiService = new SchedaLavoroComponentiService();