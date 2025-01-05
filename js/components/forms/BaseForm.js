// Componente base per i form
export class BaseForm {
    constructor(formId) {
        this.form = document.getElementById(formId);
    }

    getFormData() {
        return Object.fromEntries(new FormData(this.form));
    }

    reset() {
        this.form.reset();
    }

    setValues(data) {
        Object.entries(data).forEach(([key, value]) => {
            if (this.form[key]) {
                if (key === 'attivo') {
                    this.form[key].checked = value;
                } else {
                    this.form[key].value = value || '';
                }
            }
        });
    }
}