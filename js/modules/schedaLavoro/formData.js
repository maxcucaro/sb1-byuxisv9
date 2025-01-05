export function getFormData(form) {
  return Object.fromEntries(new FormData(form));
}

export function setFormValues(form, data) {
  if (!data) return;
  
  Object.entries(data).forEach(([key, value]) => {
    const input = form.elements[key];
    if (input) {
      if (key === 'data_inizio' || key === 'data_fine') {
        input.value = value ? value.split('T')[0] : '';
      } else {
        input.value = value || '';
      }
    }
  });
}