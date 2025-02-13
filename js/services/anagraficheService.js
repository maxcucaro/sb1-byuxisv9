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

    async addCliente(formData) {
        return handleError(async () => {
            const cleanData = this.cleanFormData(formData);
            const { data, error } = await supabase
                .from('clienti')
                .insert([cleanData])
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiunta cliente');
    }

    async updateCliente(id, formData) {
        return handleError(async () => {
            const cleanData = this.cleanFormData(formData);
            const { data, error } = await supabase
                .from('clienti')
                .update(cleanData)
                .eq('id', id)
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiornamento cliente');
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

    async addCAT(formData) {
        return handleError(async () => {
            const cleanData = this.cleanFormData(formData);
            const { data, error } = await supabase
                .from('cat')
                .insert([cleanData])
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiunta CAT');
    }

    async updateCAT(id, formData) {
        return handleError(async () => {
            const cleanData = this.cleanFormData(formData);
            const { data, error } = await supabase
                .from('cat')
                .update(cleanData)
                .eq('id', id)
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiornamento CAT');
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

    async addFornitore(formData) {
        return handleError(async () => {
            const cleanData = this.cleanFormData(formData);
            const { data, error } = await supabase
                .from('fornitori')
                .insert([cleanData])
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiunta fornitore');
    }

    async updateFornitore(id, formData) {
        return handleError(async () => {
            const cleanData = this.cleanFormData(formData);
            const { data, error } = await supabase
                .from('fornitori')
                .update(cleanData)
                .eq('id', id)
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiornamento fornitore');
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

    async addProduzione(formData) {
        return handleError(async () => {
            const cleanData = this.cleanFormData(formData);
            const { data, error } = await supabase
                .from('produzioni')
                .insert([cleanData])
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiunta produzione');
    }

    async updateProduzione(id, formData) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('produzioni')
                .update(formData)
                .eq('id', id)
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiornamento produzione');
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