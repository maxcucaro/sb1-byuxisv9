// articoliService.js

import { supabase } from '../utils/supabaseClient.js';

class ArticoliService {
    async getArticoli(settore) {
        try {
            if (!settore) {
                throw new Error('Settore non specificato');
            }

            const tableName = `articoli_${settore.toLowerCase()}`;
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .order('cod', { ascending: true });

            if (error) {
                throw new Error(`Errore query ${tableName}: ${error.message}`);
            }

            return { success: true, data: data || [] };
        } catch (error) {
            console.error(`Errore durante il recupero articoli ${settore}:`, error);
            return { success: false, error: error.message };
        }
    }

    async getNextCode(settore) {
        try {
            if (!settore) {
                throw new Error('Settore non specificato');
            }

            const tableName = `articoli_${settore.toLowerCase()}`;
            const prefix = settore.substring(0, 2).toUpperCase();

            const { data, error } = await supabase
                .from(tableName)
                .select('cod')
                .order('cod', { ascending: false })
                .limit(1);

            if (error) throw error;

            if (!data || data.length === 0) {
                return `${prefix}-0001`;
            }

            const lastCode = data[0].cod;
            const lastNumber = parseInt(lastCode.split('-')[1]);
            return `${prefix}-${String(lastNumber + 1).padStart(4, '0')}`;
        } catch (error) {
            console.error('Errore durante generazione codice:', error);
            throw error;
        }
    }

    async insertArticolo(settore, formData) {
        try {
            if (!settore) {
                throw new Error('Settore non specificato');
            }

            const tableName = `articoli_${settore.toLowerCase()}`;
            const cod = await this.getNextCode(settore);
            
            const { data, error } = await supabase
                .from(tableName)
                .insert([{
                    ...formData,
                    cod,
                    settore: settore.toUpperCase()
                }])
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error(`Errore durante inserimento articolo:`, error);
            return { success: false, error: error.message };
        }
    }

    async updateArticolo(settore, cod, formData) {
        try {
            if (!settore || !cod) {
                throw new Error('Settore e codice sono richiesti');
            }

            const tableName = `articoli_${settore.toLowerCase()}`;

            const { data, error } = await supabase
                .from(tableName)
                .update(formData)
                .eq('cod', cod)
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error(`Errore durante aggiornamento articolo:`, error);
            return { success: false, error: error.message };
        }
    }

    async toggleStato(settore, cod, nuovoStato) {
        try {
            if (!settore || !cod) {
                throw new Error('Settore e codice sono richiesti');
            }

            const tableName = `articoli_${settore.toLowerCase()}`;

            const { data, error } = await supabase
                .from(tableName)
                .update({ attivo: nuovoStato })
                .eq('cod', cod)
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error(`Errore durante aggiornamento stato:`, error);
            return { success: false, error: error.message };
        }
    }

    async getKitByArticolo(settore, cod) {
        try {
            const { data, error } = await supabase
                .from('kit_articoli')
                .select('*, kit_componenti!inner(*)')
                .eq('settore', settore)
                .eq('articolo_cod', cod);

            if (error) {
                throw new Error(`Errore query kit_articoli: ${error.message}`);
            }

            return { success: true, data };
        } catch (error) {
            console.error('Errore durante il recupero dei kit:', error);
            return { success: false, error: error.message };
        }
    }
}

export const articoliService = new ArticoliService();
