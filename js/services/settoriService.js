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

    async getCategorieBySettore(settore) {
        return handleError(async () => {
            if (!settore) throw new Error('Settore non specificato');

            const { data, error } = await supabase
                .from('settori_categorie')
                .select('*')
                .eq('settore', settore.toUpperCase())
                .order('categoria');

            if (error) throw error;
            return { success: true, data };
        }, 'recupero categorie per settore');
    }

    async addCategoria(settore, categoria, attivo = true) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('settori_categorie')
                .insert([{
                    settore: settore.toUpperCase(),
                    categoria,
                    attivo
                }])
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiunta categoria');
    }

    async updateCategoria(id, categoria) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('settori_categorie')
                .update({ categoria })
                .eq('id', id)
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiornamento categoria');
    }

    async toggleStatoCategoria(id, nuovoStato) {
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

    async getCategoriaById(id) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('settori_categorie')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return { success: true, data };
        }, 'recupero categoria per id');
    }
}

export const settoriService = new SettoriService();