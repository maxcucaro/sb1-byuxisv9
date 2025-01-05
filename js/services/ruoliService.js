import { supabase } from '../utils/supabaseClient.js';
import { handleError } from '../utils/errorHandling.js';

class RuoliService {
    async getRuoli() {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('ruoli')
                .select('*')
                .eq('attivo', true)
                .order('nome');

            if (error) throw error;
            return { success: true, data };
        }, 'recupero ruoli');
    }

    async createRuolo(formData) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('ruoli')
                .insert([{
                    nome: formData.nome_ruolo,
                    descrizione: formData.descrizione_ruolo,
                    permessi: Array.from(formData.querySelectorAll('input[name="permessi"]:checked'))
                        .map(cb => cb.value),
                    attivo: true
                }])
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'creazione ruolo');
    }
}

export const ruoliService = new RuoliService();