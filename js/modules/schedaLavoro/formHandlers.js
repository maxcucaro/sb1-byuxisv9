import { schedeLavoroService } from '../../services/schedeLavoroService.js';
import { validateSchedaForm } from './formValidation.js';
import { getFormData } from './formData.js';
import { navigateToVisualizzaScheda, navigateBack } from '../navigation/schedeLavoro.js';

export async function handleSchedaSubmit(form, schedaId) {
    try {
        const formData = getFormData(form);
        validateSchedaForm(formData);
        
        const result = schedaId ? 
            await schedeLavoroService.updateSchedaLavoro(schedaId, formData) :
            await schedeLavoroService.addSchedaLavoro(formData);
        
        if (result.success) {
            alert(`Scheda lavoro ${schedaId ? 'aggiornata' : 'creata'} con successo!`);
            navigateToVisualizzaScheda(schedaId || result.data[0].id);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        alert('Errore durante il salvataggio: ' + error.message);
    }
}

export function handleCancel() {
    if (confirm('Sei sicuro di voler annullare? Le modifiche non salvate andranno perse.')) {
        navigateBack();
    }
}