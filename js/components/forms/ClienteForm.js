import { BaseForm } from './BaseForm.js';

export class ClienteForm extends BaseForm {
    constructor() {
        super('clienteForm');
    }

    validate() {
        // Validazione specifica per il form cliente
        const ragioneSociale = this.form.ragione_sociale.value.trim();
        if (!ragioneSociale) {
            throw new Error('La ragione sociale è obbligatoria');
        }
        return true;
    }

    getFormData() {
        const data = super.getFormData();
        data.attivo = this.form.attivo.checked;
        return data;
    }
}