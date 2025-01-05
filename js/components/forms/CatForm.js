import { BaseForm } from './BaseForm.js';

export class CatForm extends BaseForm {
    constructor() {
        super('catForm');
    }

    validate() {
        const formData = this.getFormData();
        
        // Required fields validation
        if (!formData.nome?.trim()) {
            throw new Error('Il nome è obbligatorio');
        }
        if (!formData.cognome?.trim()) {
            throw new Error('Il cognome è obbligatorio');
        }

        // Optional fields validation
        if (formData.email && !this.validateEmail(formData.email)) {
            throw new Error('Email non valida');
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