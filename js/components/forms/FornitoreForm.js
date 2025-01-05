import { BaseForm } from './BaseForm.js';

export class FornitoreForm extends BaseForm {
    constructor() {
        super('fornitoreForm');
    }

    validate() {
        const formData = this.getFormData();
        
        // Required fields validation
        if (!formData.ragione_sociale?.trim()) {
            throw new Error('La ragione sociale è obbligatoria');
        }

        // Optional fields validation
        if (formData.email && !this.validateEmail(formData.email)) {
            throw new Error('Email non valida');
        }
        if (formData.pec && !this.validateEmail(formData.pec)) {
            throw new Error('PEC non valida');
        }
        if (formData.telefono && !this.validatePhone(formData.telefono)) {
            throw new Error('Numero di telefono non valido');
        }

        return true;
    }

    getFormData() {
        const data = super.getFormData();
        data.attivo = this.form.attivo.checked;
        
        // Clean up empty strings
        Object.keys(data).forEach(key => {
            if (data[key] === '') {
                data[key] = null;
            }
        });

        return data;
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    validatePhone(phone) {
        return /^[+]?[\d\s-]{5,20}$/.test(phone);
    }
}