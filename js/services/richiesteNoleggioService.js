import { supabase } from '../utils/supabaseClient.js';
import { handleError } from '../utils/errorHandling.js';

class RichiesteNoleggioService {
    async getRichieste() {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('richieste_noleggio')
                .select(`
                    *,
                    fornitore:fornitori(ragione_sociale),
                    articoli:richieste_noleggio_articoli(*)
                `)
                .order('data_richiesta', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        }, 'recupero richieste noleggio');
    }

    async getRichiestaById(id) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('richieste_noleggio')
                .select(`
                    *,
                    fornitore:fornitori(id, ragione_sociale),
                    articoli:richieste_noleggio_articoli(*)
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) throw new Error('Richiesta non trovata');

            return { success: true, data };
        }, 'recupero richiesta noleggio');
    }

    async createRichiesta(formData) {
        return handleError(async () => {
            const { articoli, ...richiestaData } = formData;

            // Inserisci la richiesta principale
            const { data: richiesta, error: richiestaError } = await supabase
                .from('richieste_noleggio')
                .insert([richiestaData])
                .select()
                .single();

            if (richiestaError) throw richiestaError;

            // Inserisci gli articoli
            if (articoli?.length > 0) {
                const articoliData = articoli.map(art => ({
                    ...art,
                    richiesta_id: richiesta.id
                }));

                const { error: articoliError } = await supabase
                    .from('richieste_noleggio_articoli')
                    .insert(articoliData);

                if (articoliError) throw articoliError;
            }

            return { success: true, data: richiesta };
        }, 'creazione richiesta noleggio');
    }

    async updateRichiesta(id, formData) {
        return handleError(async () => {
            const { articoli, ...richiestaData } = formData;

            // Aggiorna la richiesta principale
            const { data: richiesta, error: richiestaError } = await supabase
                .from('richieste_noleggio')
                .update(richiestaData)
                .eq('id', id)
                .select()
                .single();

            if (richiestaError) throw richiestaError;

            // Elimina gli articoli esistenti
            const { error: deleteError } = await supabase
                .from('richieste_noleggio_articoli')
                .delete()
                .eq('richiesta_id', id);

            if (deleteError) throw deleteError;

            // Inserisci i nuovi articoli
            if (articoli?.length > 0) {
                const articoliData = articoli.map(art => ({
                    ...art,
                    richiesta_id: id
                }));

                const { error: articoliError } = await supabase
                    .from('richieste_noleggio_articoli')
                    .insert(articoliData);

                if (articoliError) throw articoliError;
            }

            return { success: true, data: richiesta };
        }, 'aggiornamento richiesta noleggio');
    }

    async updateStato(id, nuovoStato) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('richieste_noleggio')
                .update({ stato: nuovoStato })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiornamento stato richiesta noleggio');
    }
}

export const richiesteNoleggioService = new RichiesteNoleggioService();