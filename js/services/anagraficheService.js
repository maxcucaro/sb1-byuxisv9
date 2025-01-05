import { supabase } from '../utils/supabaseClient.js';
import { handleError } from '../utils/errorHandling.js';

class AnagraficheService {
    // Clienti methods
    async getClienti() {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('clienti')
                .select('*')
                .eq('attivo', true)
                .order('ragione_sociale', { ascending: true });

            if (error) throw error;
            return { success: true, data };
        }, 'recupero clienti');
    }

    // CAT methods
    async getCAT() {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('cat')
                .select('*')
                .eq('attivo', true)
                .order('cognome', { ascending: true })
                .order('nome', { ascending: true });

            if (error) throw error;
            return { success: true, data };
        }, 'recupero CAT');
    }

    // Fornitori methods
    async getFornitori() {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('fornitori')
                .select('*')
                .eq('attivo', true)
                .order('ragione_sociale', { ascending: true });

            if (error) throw error;
            return { success: true, data };
        }, 'recupero fornitori');
    }

    // Produzioni methods
    async getProduzioni() {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('produzioni')
                .select('*')
                .eq('attivo', true)
                .order('nome', { ascending: true });

            if (error) throw error;
            return { success: true, data };
        }, 'recupero produzioni');
    }

    cleanFormData(formData) {
        const cleanData = { ...formData };
        
        // Convert empty strings to null
        Object.keys(cleanData).forEach(key => {
            if (cleanData[key] === '') {
                cleanData[key] = null;
            }
        });

        return cleanData;
    }
}

export const anagraficheService = new AnagraficheService();