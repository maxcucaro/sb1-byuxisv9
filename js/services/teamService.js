import { supabase } from '../utils/supabaseClient.js';
import { handleError } from '../utils/errorHandling.js';

class TeamService {
    async getTeam() {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('team')
                .select('*')
                .order('cognome', { ascending: true })
                .order('nome', { ascending: true });

            if (error) throw error;
            return { success: true, data };
        }, 'recupero team');
    }

    async addDipendente(formData) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('team')
                .insert([formData])
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'inserimento dipendente');
    }

    async updateDipendente(id, formData) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('team')
                .update(formData)
                .eq('id', id)
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiornamento dipendente');
    }

    async toggleStatoDipendente(id, nuovoStato) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('team')
                .update({ attivo: nuovoStato })
                .eq('id', id)
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'modifica stato dipendente');
    }

    async createRuolo(formData) {
        return handleError(async () => {
            const permessi = Array.from(
                document.querySelectorAll('input[name="permessi"]:checked')
            ).map(cb => cb.value);

            const { data, error } = await supabase
                .from('ruoli')
                .insert([{
                    nome: formData.nome_ruolo,
                    descrizione: formData.descrizione_ruolo,
                    permessi: permessi,
                    attivo: true
                }])
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'creazione ruolo');
    }
}

export const teamService = new TeamService();