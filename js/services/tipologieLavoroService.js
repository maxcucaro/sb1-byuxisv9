import { supabase } from '../utils/supabaseClient.js';
import { handleError } from '../utils/errorHandling.js';

class TipologieLavoroService {
    async getConfigurazioneTipologia(tipo) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('tipologie_lavoro')
                .select('*')
                .eq('tipo', tipo)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            
            // Se non esiste, restituisci una configurazione di default
            if (!data) {
                return {
                    success: true,
                    data: {
                        tipo: tipo,
                        attivo: true,
                        richiedi_cliente: false,
                        richiedi_preventivo: false,
                        richiedi_ddt: false,
                        note: ''
                    }
                };
            }

            return { success: true, data };
        }, 'recupero configurazione tipologia');
    }

    async updateConfigurazioneTipologia(tipo, formData) {
        return handleError(async () => {
            const { data: existing } = await supabase
                .from('tipologie_lavoro')
                .select('*')
                .eq('tipo', tipo)
                .single();

            let result;
            if (existing) {
                // Update
                result = await supabase
                    .from('tipologie_lavoro')
                    .update(formData)
                    .eq('tipo', tipo)
                    .select();
            } else {
                // Insert
                result = await supabase
                    .from('tipologie_lavoro')
                    .insert([{ ...formData, tipo }])
                    .select();
            }

            if (result.error) throw result.error;
            return { success: true, data: result.data[0] };
        }, 'aggiornamento configurazione tipologia');
    }

    async getTipologieAttive() {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('tipologie_lavoro')
                .select('tipo')
                .eq('attivo', true)
                .order('tipo');

            if (error) throw error;
            return { success: true, data };
        }, 'recupero tipologie attive');
    }
}

export const tipologieLavoroService = new TipologieLavoroService();