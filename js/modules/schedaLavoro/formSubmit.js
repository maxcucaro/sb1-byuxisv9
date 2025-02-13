import { queueService } from '../../services/queueService.js';

export async function handleFormSubmit(form, formData, materiali) {
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        // Validazione base
        if (!formData.nome?.trim()) throw new Error('Il nome della scheda è obbligatorio');
        if (!formData.tipo_lavoro) throw new Error('Il tipo di lavoro è obbligatorio');
        if (!formData.data_inizio) throw new Error('La data di inizio è obbligatoria');
        if (!formData.data_fine) throw new Error('La data di fine è obbligatoria');
        if (!formData.luogo?.trim()) throw new Error('Il luogo è obbligatorio');

        // Prepare clean data
        const cleanData = {
            nome: formData.nome.trim(),
            tipo_lavoro: formData.tipo_lavoro,
            data_inizio: formData.data_inizio,
            data_fine: formData.data_fine,
            luogo: formData.luogo.trim(),
            produzione_id: formData.produzione_id || null,
            cliente_id: formData.cliente_id || null,
            cat_id: formData.cat_id || null,
            fornitore_id: formData.fornitore_id || null,
            responsabile_id: formData.responsabile_id || null,
            note: formData.note?.trim() || null,
            note_sopralluogo: formData.note_sopralluogo?.trim() || null,
            link_documenti: formData.link_documenti?.trim() || null
        };

        // Aggiungi alla coda
        const added = await queueService.addToQueue('CREATE_SCHEDA', {
            formData: cleanData,
            materiali: materiali?.length > 0 ? materiali : null
        });

        if (!added) {
            throw new Error('Impossibile aggiungere l\'operazione alla coda');
        }

        // Rimuovi la bozza dopo il successo
        queueService.clearDraft();

        alert('Scheda lavoro aggiunta alla coda di elaborazione!');
        window.location.href = 'liste-aperte.html';

    } catch (error) {
        console.error('Errore durante il salvataggio:', error);
        
        // Salva come bozza in caso di errore
        const saved = await queueService.saveDraft({
            formData,
            materiali,
            lastError: error.message,
            timestamp: new Date().toISOString()
        });

        if (saved) {
            alert('Si è verificato un errore, ma i dati sono stati salvati come bozza. ' +
                  'Puoi riprovare più tardi.\n\nErrore: ' + error.message);
        } else {
            alert('Errore durante il salvataggio: ' + error.message);
        }
    } finally {
        submitButton.disabled = false;
    }
}