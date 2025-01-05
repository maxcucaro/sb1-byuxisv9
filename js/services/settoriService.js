import { supabase } from '../utils/supabaseClient.js';
import { handleError } from '../utils/errorHandling.js';

class SettoriService {
    async getSettoriCategorie() {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('settori_categorie')
                .select('*')
                .order('settore', { ascending: true })
                .order('categoria', { ascending: true });

            if (error) throw error;
            return { success: true, data };
        }, 'recupero settori e categorie');
    }

    async addCategoria(settore, categoria, attivo = true) {
        return handleError(async () => {
            // Verifica se la categoria esiste già
            const { data: existing } = await supabase
                .from('settori_categorie')
                .select('*')
                .eq('settore', settore)
                .eq('categoria', categoria)
                .maybeSingle();

            if (existing) {
                throw new Error('Questa categoria esiste già per il settore selezionato');
            }

            const { data, error } = await supabase
                .from('settori_categorie')
                .insert([{ settore, categoria, attivo }])
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiunta categoria');
    }

    async updateCategoria(id, nuovoNome) {
        return handleError(async () => {
            // Verifica se il nuovo nome esiste già
            const { data: categoria } = await supabase
                .from('settori_categorie')
                .select('settore')
                .eq('id', id)
                .single();

            if (!categoria) throw new Error('Categoria non trovata');

            const { data: existing } = await supabase
                .from('settori_categorie')
                .select('*')
                .eq('settore', categoria.settore)
                .eq('categoria', nuovoNome)
                .neq('id', id)
                .maybeSingle();

            if (existing) {
                throw new Error('Esiste già una categoria con questo nome nel settore');
            }

            const { data, error } = await supabase
                .from('settori_categorie')
                .update({ categoria: nuovoNome })
                .eq('id', id)
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiornamento categoria');
    }

    async toggleCategoriaStato(id, nuovoStato) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('settori_categorie')
                .update({ attivo: nuovoStato })
                .eq('id', id)
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'modifica stato categoria');
    }
}

export const settoriService = new SettoriService();