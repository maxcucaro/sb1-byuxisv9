import { supabaseInstance } from '../utils/supabaseClient.js';
import { handleError } from '../utils/errorHandling.js';

class SchedeLavoroService {
    async getSchedeLavoro() {
        return handleError(async () => {
            const { data, error } = await supabaseInstance.retryOperation(
                async (supabase) => {
                    return await supabase
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
                },
                'recupero schede lavoro'
            );

            if (error) throw error;
            return { success: true, data: data || [] };
        }, 'recupero schede lavoro');
    }

    validateId(id) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
            throw new Error('ID scheda non valido');
        }
        return true;
    }

    async getSchedaLavoroById(id) {
        return handleError(async () => {
            this.validateId(id);

            const { data, error } = await supabaseInstance.retryOperation(
                async (supabase) => {
                    return await supabase
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
                },
                'recupero scheda lavoro'
            );

            if (error) throw error;
            if (!data) throw new Error('Scheda non trovata');

            return { success: true, data };
        }, 'recupero scheda lavoro');
    }

    async addSchedaLavoro(formData) {
        return handleError(async () => {
            // Validate required fields
            if (!formData.nome?.trim()) throw new Error('Il nome è obbligatorio');
            if (!formData.tipo_lavoro) throw new Error('Il tipo di lavoro è obbligatorio');
            if (!formData.data_inizio) throw new Error('La data di inizio è obbligatoria');
            if (!formData.data_fine) throw new Error('La data di fine è obbligatoria');
            if (!formData.luogo?.trim()) throw new Error('Il luogo è obbligatorio');

            // Validate dates
            const inizio = new Date(formData.data_inizio);
            const fine = new Date(formData.data_fine);
            if (inizio > fine) {
                throw new Error('La data di inizio non può essere successiva alla data di fine');
            }

            // Clean up empty fields but preserve specific fields that can be null
            const cleanData = {
                nome: formData.nome.trim(),
                tipo_lavoro: formData.tipo_lavoro,
                data_inizio: formData.data_inizio,
                data_fine: formData.data_fine,
                luogo: formData.luogo.trim(),
                produzione_id: formData.produzione_id || null,
                cliente_id: formData.cliente_id || null,
                cat_id: formData.cat_id || null,
                fornitore_id: formData.fornitore_id || null,
                responsabile_id: formData.responsabile_id || null,
                note: formData.note?.trim() || null,
                note_sopralluogo: formData.note_sopralluogo?.trim() || null,
                link_documenti: formData.link_documenti?.trim() || null
            };

            const { data, error } = await supabaseInstance.retryOperation(
                async (supabase) => {
                    return await supabase
                        .from('schede_lavoro')
                        .insert([cleanData])
                        .select();
                },
                'creazione scheda lavoro'
            );

            if (error) throw error;
            return { success: true, data };
        }, 'creazione scheda lavoro');
    }

    async updateSchedaLavoro(id, formData) {
        return handleError(async () => {
            this.validateId(id);

            // Clean up empty fields but preserve specific fields that can be null
            const cleanData = {
                nome: formData.nome?.trim(),
                tipo_lavoro: formData.tipo_lavoro,
                data_inizio: formData.data_inizio,
                data_fine: formData.data_fine,
                luogo: formData.luogo?.trim(),
                produzione_id: formData.produzione_id || null,
                cliente_id: formData.cliente_id || null,
                cat_id: formData.cat_id || null,
                fornitore_id: formData.fornitore_id || null,
                responsabile_id: formData.responsabile_id || null,
                note: formData.note?.trim() || null,
                note_sopralluogo: formData.note_sopralluogo?.trim() || null,
                link_documenti: formData.link_documenti?.trim() || null
            };

            const { data, error } = await supabaseInstance.retryOperation(
                async (supabase) => {
                    return await supabase
                        .from('schede_lavoro')
                        .update(cleanData)
                        .eq('id', id)
                        .select();
                },
                'aggiornamento scheda lavoro'
            );

            if (error) throw error;
            return { success: true, data };
        }, 'aggiornamento scheda lavoro');
    }

    async updateStato(id, nuovoStato) {
        return handleError(async () => {
            this.validateId(id);

            const { data, error } = await supabaseInstance.retryOperation(
                async (supabase) => {
                    return await supabase
                        .from('schede_lavoro')
                        .update({ stato: nuovoStato })
                        .eq('id', id)
                        .select();
                },
                'aggiornamento stato scheda lavoro'
            );

            if (error) throw error;
            return { success: true, data };
        }, 'aggiornamento stato scheda lavoro');
    }
}

export const schedeLavoroService = new SchedeLavoroService();