export async function populateSelect(selectElement, options, defaultOption = 'Seleziona...') {
    if (!selectElement) return;

    selectElement.innerHTML = `<option value="">${defaultOption}</option>`;
    
    options.forEach(option => {
        const optElement = document.createElement('option');
        optElement.value = option.value;
        optElement.textContent = option.label;
        selectElement.appendChild(optElement);
    });
}

export function showFormField(fieldId, form) {
    const container = form.querySelector(`[data-field="${fieldId}"]`);
    if (container) {
        container.style.display = 'block';
        const input = form[fieldId];
        if (input) {
            input.required = true;
        }
    }
}

export function hideFormField(fieldId, form) {
    const container = form.querySelector(`[data-field="${fieldId}"]`);
    if (container) {
        container.style.display = 'none';
        const input = form[fieldId];
        if (input) {
            input.required = false;
            input.value = '';
        }
    }
}