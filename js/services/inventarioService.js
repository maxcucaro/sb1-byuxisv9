import { supabase } from '../utils/supabaseClient.js';
import { SETTORI } from '../utils/constants.js';
import { handleError } from '../utils/errorHandling.js';

class InventarioService {
    async getInventarioAttivo(data = null) {
        return handleError(async () => {
            const settoriKeys = Object.keys(SETTORI);
            let results = [];
            let isFirstSector = true;

            for (const settore of settoriKeys) {
                const { data: articoli } = await this.getArticoliSettore(settore.toLowerCase(), data);
                
                if (articoli && articoli.length > 0) {
                    if (!isFirstSector) {
                        results.push(this.createSpacer());
                    }
                    results.push(...articoli);
                    isFirstSector = false;
                }
            }

            return { success: true, data: results };
        }, 'recupero inventario');
    }

    async getArticoliSettore(settore, data = null) {
        const query = supabase
            .from(`articoli_${settore}`)
            .select('cod, descrizione, settore, categoria, quantita')
            .eq('attivo', true)
            .order('cod');

        if (data) {
            query.lte('created_at', data);
        }

        return await query;
    }

    createSpacer() {
        return {
            cod: '',
            descrizione: '',
            settore: '',
            categoria: '',
            quantita: '',
            isSpacer: true
        };
    }
}

export const inventarioService = new InventarioService();