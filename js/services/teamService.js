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

    async getDipendenteById(id) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('team')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return { success: true, data };
        }, 'recupero dipendente');
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

    async updateRuolo(id, formData) {
        return handleError(async () => {
            const { data, error } = await supabase
                .from('team')
                .update({ ruolo: formData.ruolo })
                .eq('id', id)
                .select();

            if (error) throw error;
            return { success: true, data };
        }, 'aggiornamento ruolo');
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

    async deleteDipendente(id) {
        return handleError(async () => {
            const { error } = await supabase
                .from('team')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        }, 'eliminazione dipendente');
    }

    async createRuolo(form) {
        return handleError(async () => {
            const permessi = Array.from(
                form.querySelectorAll('input[name="permessi"]:checked')
            ).map(cb => cb.value);

            const { data, error } = await supabase
                .from('ruoli')
                .insert([{
                    nome: form.nome_ruolo.value,
                    descrizione: form.descrizione_ruolo.value,
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