import { supabaseInstance } from '../utils/supabaseClient.js';
import { handleError } from '../utils/errorHandling.js';

class MaterialiRichiestiService {
    async getMaterialiRichiesti(schedaId) {
        return handleError(async () => {
            if (!schedaId) {
                return { success: true, data: [] };
            }

            const { data: materiali, error } = await supabaseInstance.retryOperation(async (supabase) => {
                return await supabase
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
                    .order('settore', { ascending: true })
                    .order('articolo_cod', { ascending: true });
            });

            if (error) throw error;

            const materialiCompleti = await Promise.all((materiali || []).map(async (materiale) => {
                try {
                    const settore = materiale.settore.toLowerCase();
                    const { data: articolo } = await supabaseInstance.retryOperation(async (supabase) => {
                        return await supabase
                            .from('articoli_' + settore)
                            .select('descrizione, categoria')
                            .eq('cod', materiale.articolo_cod)
                            .maybeSingle();
                    });

                    return {
                        ...materiale,
                        descrizione: articolo?.descrizione || 'Non trovato',
                        categoria: articolo?.categoria || '-'
                    };
                } catch (error) {
                    console.error(`Errore recupero articolo ${materiale.articolo_cod}:`, error);
                    return {
                        ...materiale,
                        descrizione: 'Errore recupero dati',
                        categoria: '-'
                    };
                }
            }));

            return { success: true, data: materialiCompleti || [] };
        }, 'recupero materiali richiesti');
    }

    async updateRichiestaMateriali(schedaId, materiali) {
        return handleError(async () => {
            if (!schedaId || !materiali?.length) {
                throw new Error('Dati richiesta non validi');
            }

            // Validate materials data
            const validatedMaterials = materiali.map(m => {
                if (!m.settore || !m.cod || !m.quantita) {
                    throw new Error('Dati materiale incompleti');
                }
                return {
                    settore: m.settore,
                    articolo_cod: m.cod,
                    quantita: parseInt(m.quantita),
                    note: m.note || null,
                    stato: 'RICHIESTO'
                };
            });

            const { error } = await supabaseInstance.retryOperation(async (supabase) => {
                return await supabase.rpc('aggiorna_materiali_richiesti', {
                    p_scheda_id: schedaId,
                    p_materiali: validatedMaterials
                });
            });

            if (error) throw error;
            return await this.getMaterialiRichiesti(schedaId);
        }, 'aggiornamento richiesta materiali');
    }
}

export const materialiRichiestiService = new MaterialiRichiestiService();