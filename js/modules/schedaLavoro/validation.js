export function validateFormData(data) {
    // Validazione campi base
    if (!data.nome?.trim()) {
        return { isValid: false, error: 'Il nome della scheda è obbligatorio' };
    }

    if (!data.tipo_lavoro) {
        return { isValid: false, error: 'Il tipo di lavoro è obbligatorio' };
    }

    if (!data.data_inizio) {
        return { isValid: false, error: 'La data di inizio è obbligatoria' };
    }

    if (!data.data_fine) {
        return { isValid: false, error: 'La data di fine è obbligatoria' };
    }

    if (!data.luogo?.trim()) {
        return { isValid: false, error: 'Il luogo è obbligatorio' };
    }

    const inizio = new Date(data.data_inizio);
    const fine = new Date(data.data_fine);
    if (inizio > fine) {
        return { isValid: false, error: 'La data di inizio non può essere successiva alla data di fine' };
    }

    // Validazione campi specifici per tipo
    switch (data.tipo_lavoro) {
        case 'INTERNO':
            if (!data.produzione_id) {
                return { isValid: false, error: 'La produzione è obbligatoria per lavori interni' };
            }
            break;
        case 'NOLEGGIO':
        case 'CONTOVISIONE':
            if (!data.cliente_id) {
                return { isValid: false, error: 'Il cliente è obbligatorio per noleggi e contovisioni' };
            }
            break;
        case 'ASSISTENZA':
            if (!data.cat_id) {
                return { isValid: false, error: 'Il CAT è obbligatorio per assistenza tecnica' };
            }
            break;
    }

    return { isValid: true };
}