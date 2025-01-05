import { supabase } from '../utils/supabaseClient.js';

class MaterialiRichiestiService {
    async getMaterialiRichiesti(schedaId) {
        try {
            if (!schedaId) {
                throw new Error('ID scheda non valido');
            }

            // Get all requested materials with full details
            const { data, error } = await supabase
                .from('materiali_richiesti')
                .select(`
                    id,
                    scheda_id,
                    settore,
                    articolo_cod,
                    quantita,
                    note,
                    stato,
                    quantita_preparata,
                    note_preparazione
                `)
                .eq('scheda_id', schedaId)
                .order('created_at');

            if (error) throw error;

            // Log for debugging
            console.log('Materiali richiesti trovati:', data);
            
            return { success: true, data: data || [] };
        } catch (error) {
            console.error('Errore durante il recupero materiali:', error);
            return { success: false, error: error.message };
        }
    }

    async addRichiestaMateriali(schedaId, materiali) {
        try {
            if (!schedaId) {
                throw new Error('ID scheda non valido');
            }

            if (!materiali?.length) {
                throw new Error('Nessun materiale da salvare');
            }

            // Delete existing materiali if any
            await supabase
                .from('materiali_richiesti')
                .delete()
                .eq('scheda_id', schedaId);

            // Insert new materiali
            const { data, error } = await supabase
                .from('materiali_richiesti')
                .insert(materiali.map(m => ({
                    scheda_id: schedaId,
                    settore: m.settore,
                    articolo_cod: m.cod,
                    quantita: m.quantita,
                    note: m.note || '',
                    stato: 'RICHIESTO'
                })))
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Errore durante il salvataggio materiali:', error);
            return { success: false, error: error.message };
        }
    }

    async updatePreparazione(schedaId, materiali) {
        try {
            if (!schedaId) {
                throw new Error('ID scheda non valido');
            }

            if (!materiali?.length) {
                throw new Error('Nessun materiale da salvare');
            }

            // Update materiali with prepared quantities
            const { data, error } = await supabase
                .from('materiali_richiesti')
                .upsert(materiali.map(m => ({
                    scheda_id: schedaId,
                    settore: m.settore,
                    articolo_cod: m.articolo_cod,
                    quantita_preparata: m.quantita,
                    note_preparazione: m.note || '',
                    stato: 'PREPARATO'
                })), {
                    onConflict: ['scheda_id', 'settore', 'articolo_cod']
                })
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Errore durante il salvataggio preparazione:', error);
            return { success: false, error: error.message };
        }
    }
}

export const materialiRichiestiService = new MaterialiRichiestiService();