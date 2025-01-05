// Utility functions for form handling
export function populateCategorieSelect(selectElement, settore, settori) {
    // Clear existing options
    selectElement.innerHTML = '<option value="">Seleziona categoria</option>';
    
    // Get categories for the sector
    const settoreInfo = settori[settore.toUpperCase()];
    if (settoreInfo && settoreInfo.categorie) {
        settoreInfo.categorie.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            selectElement.appendChild(option);
        });
    }
}

export function getFormData(form) {
    return {
        descrizione: form.descrizione.value,
        categoria: form.categoria.value,
        quantita: parseInt(form.quantita.value),
        base: form.base.value ? parseFloat(form.base.value) : null,
        altezza: form.altezza.value ? parseFloat(form.altezza.value) : null,
        profondita: form.profondita.value ? parseFloat(form.profondita.value) : null,
        peso: form.peso.value ? parseFloat(form.peso.value) : null,
        ubicazione: form.ubicazione.value,
        attivo: form.attivo.checked
    };
}