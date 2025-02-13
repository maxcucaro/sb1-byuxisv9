import { supabase } from '../utils/supabaseClient.js';
import { handleError } from '../utils/errorHandling.js';

class SopralluogoService {
    async getSopralluoghi() {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('sopralluoghi')
                .select(`
                    *,
                    produzione:produzioni(nome),
                    cliente:clienti(ragione_sociale),
                    cat:cat(nome, cognome),
                    fornitore:fornitori(ragione_sociale),
                    responsabile:team(nome, cognome)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { success: true, data: data || [] };
        }, 'recupero sopralluoghi');
    }

    async getSopralluogoById(id) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('sopralluoghi')
                .select(`
                    *,
                    produzione:produzioni(id, nome),
                    cliente:clienti(id, ragione_sociale),
                    cat:cat(id, nome, cognome),
                    fornitore:fornitori(id, ragione_sociale),
                    responsabile:team(id, nome, cognome)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) throw new Error('Sopralluogo non trovato');

            return { success: true, data };
        }, 'recupero sopralluogo');
    }

    async createSopralluogo(formData) {
        return handleError(async () => {
            // Validate required fields
            if (!formData.evento_nome?.trim()) throw new Error('Il nome evento è obbligatorio');
            if (!formData.tipo_lavoro) throw new Error('Il tipo di lavoro è obbligatorio');
            if (!formData.luogo?.trim()) throw new Error('Il luogo è obbligatorio');
            if (!formData.data_inizio) throw new Error('La data di inizio è obbligatoria');
            if (!formData.data_fine) throw new Error('La data di fine è obbligatoria');

            // Validate dates
            const inizio = new Date(formData.data_inizio);
            const fine = new Date(formData.data_fine);
            if (inizio > fine) {
                throw new Error('La data di inizio non può essere successiva alla data di fine');
            }

            // Clean up empty fields
            const cleanData = Object.fromEntries(
                Object.entries(formData).map(([key, value]) => [
                    key,
                    value === '' ? null : value
                ])
            );

            const { data, error } = await supabase
                .from('sopralluoghi')
                .insert([cleanData])
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'creazione sopralluogo');
    }

    async updateSopralluogo(id, formData) {
        return handleError(async () => {
            // Clean up empty fields
            const cleanData = Object.fromEntries(
                Object.entries(formData).map(([key, value]) => [
                    key,
                    value === '' ? null : value
                ])
            );

            const { data, error } = await supabase
                .from('sopralluoghi')
                .update(cleanData)
                .eq('id', id)
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiornamento sopralluogo');
    }

    async updateStato(id, nuovoStato) {
        return handleError(async () => {
            if (nuovoStato === 'COMPLETATO') {
                // Usa la funzione RPC per approvare il sopralluogo
                const { data, error } = await supabase
                    .rpc('approva_sopralluogo', { 
                        p_sopralluogo_id: id 
                    });

                if (error) throw error;
                return { success: true, data };
            } else {
                // Aggiornamento normale dello stato
                const { data, error } = await supabase
                    .from('sopralluoghi')
                    .update({ stato: nuovoStato })
                    .eq('id', id)
                    .select();

                if (error) throw error;
                return { success: true, data };
            }
        }, 'aggiornamento stato sopralluogo');
    }

    async deleteSopralluogo(id) {
        return handleError(async () => {
            const { error } = await supabase
                .from('sopralluoghi')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        }, 'eliminazione sopralluogo');
    }
}

export const sopralluogoService = new SopralluogoService();