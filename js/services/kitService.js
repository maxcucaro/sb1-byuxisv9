import { supabaseInstance } from '../utils/supabaseClient.js';
import { handleError } from '../utils/errorHandling.js';

class KitService {
    async getAllKit() {
        return handleError(async () => {
            const { data, error } = await supabaseInstance.retryOperation(async (supabase) => {
                return await supabase
                    .from('kit_articoli')
                    .select(`
                        *,
                        kit_componenti (
                            id,
                            componente_settore,
                            componente_cod,
                            componente_descrizione,
                            quantita,
                            note
                        )
                    `)
                    .order('settore', { ascending: true })
                    .order('articolo_cod', { ascending: true });
            });

            if (error) throw error;
            return { success: true, data: data || [] };
        }, 'recupero kit');
    }

    async getKitById(id) {
        return handleError(async () => {
            const { data, error } = await supabaseInstance.retryOperation(async (supabase) => {
                return await supabase
                    .from('kit_articoli')
                    .select(`
                        *,
                        kit_componenti (
                            id,
                            componente_settore,
                            componente_cod,
                            componente_descrizione,
                            quantita,
                            note
                        )
                    `)
                    .eq('id', id)
                    .single();
            });

            if (error) throw error;
            return { success: true, data };
        }, 'recupero kit per id');
    }

    async getKitByArticolo(settore, articoloCod) {
        return handleError(async () => {
            const { data, error } = await supabaseInstance.retryOperation(async (supabase) => {
                return await supabase.rpc('get_kit_completo', {
                    _settore: settore,
                    _articolo_cod: articoloCod
                });
            });

            if (error) throw error;
            if (!data || data.length === 0) {
                throw new Error('Kit non trovato');
            }

            // Convert componenti from JSON to array
            const kit = data[0];
            kit.kit_componenti = Array.isArray(kit.componenti) ? kit.componenti : [];
            delete kit.componenti;

            return { success: true, data: kit };
        }, 'recupero kit per articolo');
    }

    async createKit(formData) {
        return handleError(async () => {
            const { data: kit, error: kitError } = await supabaseInstance.retryOperation(async (supabase) => {
                return await supabase
                    .from('kit_articoli')
                    .insert([{
                        settore: formData.settore,
                        articolo_cod: formData.articolo_cod,
                        nome: formData.nome,
                        descrizione: formData.descrizione,
                        quantita_kit: formData.quantita_kit || 1,
                        note: formData.note
                    }])
                    .select()
                    .single();
            });

            if (kitError) throw kitError;

            if (formData.componenti?.length > 0) {
                const { error: componentiError } = await supabaseInstance.retryOperation(async (supabase) => {
                    return await supabase
                        .from('kit_componenti')
                        .insert(
                            formData.componenti.map(comp => ({
                                kit_id: kit.id,
                                componente_settore: comp.settore,
                                componente_cod: comp.cod,
                                quantita: comp.quantita,
                                note: comp.note
                            }))
                        );
                });

                if (componentiError) throw componentiError;
            }

            return { success: true, data: kit };
        }, 'creazione kit');
    }

    async updateKit(settore, articoloCod, formData) {
        return handleError(async () => {
            // Get existing kit
            const result = await this.getKitByArticolo(settore, articoloCod);
            if (!result.success) throw new Error(result.error);

            const kit = result.data;

            // Update kit details
            const { error: updateError } = await supabaseInstance.retryOperation(async (supabase) => {
                return await supabase
                    .from('kit_articoli')
                    .update({
                        nome: formData.nome,
                        descrizione: formData.descrizione,
                        quantita_kit: formData.quantita_kit || 1,
                        note: formData.note
                    })
                    .eq('id', kit.id);
            });

            if (updateError) throw updateError;

            // Remove existing components
            const { error: deleteError } = await supabaseInstance.retryOperation(async (supabase) => {
                return await supabase
                    .from('kit_componenti')
                    .delete()
                    .eq('kit_id', kit.id);
            });

            if (deleteError) throw deleteError;

            // Add new components
            if (formData.componenti?.length > 0) {
                const { error: componentiError } = await supabaseInstance.retryOperation(async (supabase) => {
                    return await supabase
                        .from('kit_componenti')
                        .insert(
                            formData.componenti.map(comp => ({
                                kit_id: kit.id,
                                componente_settore: comp.settore,
                                componente_cod: comp.cod,
                                quantita: comp.quantita,
                                note: comp.note
                            }))
                        );
                });

                if (componentiError) throw componentiError;
            }

            return { success: true };
        }, 'aggiornamento kit');
    }

    async toggleStatoKit(id, nuovoStato) {
        return handleError(async () => {
            const { data, error } = await supabaseInstance.retryOperation(async (supabase) => {
                return await supabase
                    .from('kit_articoli')
                    .update({ attivo: nuovoStato })
                    .eq('id', id)
                    .select();
            });

            if (error) throw error;
            return { success: true, data };
        }, 'modifica stato kit');
    }
}

export const kitService = new KitService();