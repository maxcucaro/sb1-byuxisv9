import { db } from '../config/database.js';
import { handleError } from '../utils/errorHandling.js';

class BacklineService {
    async getBacklineArticoli() {
        return handleError(async () => {
            const { data, error } = await db
                .from('articoli_backline')
                .select('*')
                .order('cod', { ascending: true });

            if (error) throw error;
            return { success: true, data: data || [] };
        }, 'recupero articoli backline');
    }

    async insertBacklineArticle(formData) {
        return handleError(async () => {
            const { data, error } = await db
                .from('articoli_backline')
                .insert([{
                    ...formData,
                    settore: 'BACKLINE'
                }])
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'inserimento articolo backline');
    }
}

// Export singleton instance
export const backlineService = new BacklineService();

// Export individual methods for direct use
export const { getBacklineArticoli, insertBacklineArticle } = backlineService;