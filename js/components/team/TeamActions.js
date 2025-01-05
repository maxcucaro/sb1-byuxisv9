import { teamService } from '../../services/teamService.js';

export async function handleAddDipendente(form) {
    const formData = Object.fromEntries(new FormData(form));
    formData.attivo = form.attivo.checked;
    
    try {
        const result = await teamService.addDipendente(formData);
        if (!result.success) throw new Error(result.error);
        return result;
    } catch (error) {
        console.error('Errore durante il salvataggio:', error);
        throw error;
    }
}

export async function handleUpdateDipendente(id, form) {
    const formData = Object.fromEntries(new FormData(form));
    formData.attivo = form.attivo.checked;
    
    try {
        const result = await teamService.updateDipendente(id, formData);
        if (!result.success) throw new Error(result.error);
        return result;
    } catch (error) {
        console.error('Errore durante l\'aggiornamento:', error);
        throw error;
    }
}

export async function handleToggleStatoDipendente(id, nuovoStato) {
    try {
        const result = await teamService.toggleStatoDipendente(id, nuovoStato);
        if (!result.success) throw new Error(result.error);
        return result;
    } catch (error) {
        console.error('Errore durante la modifica dello stato:', error);
        throw error;
    }
}