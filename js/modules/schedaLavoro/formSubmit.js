import { schedeLavoroService } from '../../services/schedeLavoroService.js';
import { validateFormData } from './validation.js';

export async function handleFormSubmit(form, shouldExit = false) {
    if (!form || !(form instanceof HTMLFormElement)) {
        throw new Error('Form non valido');
    }

    const formData = new FormData(form);
    
    const data = {
        nome: formData.get('nome'),
        tipo_lavoro: formData.get('tipo_lavoro'),
        data_inizio: formData.get('data_inizio'),
        data_fine: formData.get('data_fine'),
        luogo: formData.get('luogo'),
        note: formData.get('note')
    };

    // Responsabile è opzionale
    const responsabileId = formData.get('responsabile_id');
    if (responsabileId) {
        data.responsabile_id = responsabileId;
    }

    // Aggiungi campi specifici in base al tipo di lavoro
    switch (data.tipo_lavoro) {
        case 'INTERNO':
            data.produzione_id = formData.get('produzione_id');
            break;
        case 'NOLEGGIO':
        case 'CONTOVISIONE':
            data.cliente_id = formData.get('cliente_id');
            break;
        case 'ASSISTENZA':
            data.cat_id = formData.get('cat_id');
            break;
    }

    try {
        const validationResult = validateFormData(data);
        if (!validationResult.isValid) {
            throw new Error(validationResult.error);
        }

        const result = await schedeLavoroService.addSchedaLavoro(data);
        if (result.success) {
            alert('Scheda lavoro creata con successo!');
            if (shouldExit) {
                window.location.href = '../../schede-lavori.html';
            } else {
                window.location.href = `visualizza-scheda.html?id=${result.data[0].id}`;
            }
        } else {
            throw new Error(result.error || 'Errore durante il salvataggio');
        }
    } catch (error) {
        console.error('Errore durante creazione scheda lavoro:', error);
        alert('Errore durante il salvataggio: ' + error.message);
    }
}