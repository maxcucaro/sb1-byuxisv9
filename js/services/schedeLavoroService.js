import { supabase } from '../utils/supabaseClient.js';
import { handleError } from '../utils/errorHandling.js';

class SchedeLavoroService {
    async getSchedeLavoro() {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('schede_lavoro')
                .select(`
                    *,
                    produzione:produzioni(nome),
                    cliente:clienti(ragione_sociale),
                    cat:cat(nome, cognome),
                    fornitore:fornitori(ragione_sociale),
                    responsabile:team(nome, cognome)
                `)
                .order('data_inizio', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        }, 'recupero schede lavoro');
    }

    async getSchedaLavoroById(id) {
        return handleError(async () => {
            if (!id) throw new Error('ID scheda non valido');

            const { data, error } = await supabase
                .from('schede_lavoro')
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
            if (!data) throw new Error('Scheda non trovata');

            return { success: true, data };
        }, 'recupero scheda lavoro');
    }

    async addSchedaLavoro(formData) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('schede_lavoro')
                .insert([{
                    ...formData,
                    stato: 'BOZZA'
                }])
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'creazione scheda lavoro');
    }

    async updateSchedaLavoro(id, formData) {
        return handleError(async () => {
            if (!id) throw new Error('ID scheda non valido');

            const { data, error } = await supabase
                .from('schede_lavoro')
                .update(formData)
                .eq('id', id)
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiornamento scheda lavoro');
    }

    async updateStato(id, nuovoStato) {
        return handleError(async () => {
            if (!id) throw new Error('ID scheda non valido');

            const { data, error } = await supabase
                .from('schede_lavoro')
                .update({ stato: nuovoStato })
                .eq('id', id)
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiornamento stato scheda lavoro');
    }
}

export const schedeLavoroService = new SchedeLavoroService();