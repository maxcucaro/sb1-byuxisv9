export function getFormData(form) {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  // Clean up empty or undefined values
  Object.keys(data).forEach(key => {
    if (data[key] === '' || data[key] === undefined) {
      delete data[key];
    }
  });

  // Ensure link_documenti is included even if empty
  if (form.link_documenti) {
    data.link_documenti = form.link_documenti.value || null;
  }
  
  return data;
}

export function setFormValues(form, data) {
  if (!form || !data) {
    console.error('Form o dati mancanti');
    return;
  }
  
  // Populate form fields
  Object.entries(data).forEach(([key, value]) => {
    const element = form.elements[key];
    if (element) {
      // Handle select fields
      if (element.tagName === 'SELECT') {
        if (value) {
          element.value = value;
          // Show container if field is required and has value
          const container = form.querySelector(`[data-field="${key}"]`);
          if (container && element.required) {
            container.style.display = 'block';
          }
        }
      }
      // Handle dates
      else if (key === 'data_inizio' || key === 'data_fine') {
        element.value = value ? value.split('T')[0] : '';
      }
      // Handle checkboxes
      else if (element.type === 'checkbox') {
        element.checked = Boolean(value);
      }
      // Handle link_documenti specifically
      else if (key === 'link_documenti') {
        element.value = value || '';
      }
      // Handle other fields
      else {
        element.value = value ?? '';
      }
    }
  });

  // Show appropriate fields based on work type
  if (data.tipo_lavoro) {
    const tipoSelect = form.elements['tipo_lavoro'];
    if (tipoSelect) {
      tipoSelect.value = data.tipo_lavoro;
      // Trigger change event to show correct fields
      tipoSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
}
