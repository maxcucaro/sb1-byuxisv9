import { BaseForm } from './BaseForm.js';

export class ProduzioneForm extends BaseForm {
    constructor() {
        super('produzioneForm');
    }

    validate() {
        const nome = this.form.nome.value.trim();
        if (!nome) {
            throw new Error('Il nome della produzione è obbligatorio');
        }
        return true;
    }

    getFormData() {
        const data = super.getFormData();
        data.attivo = this.form.attivo.checked;
        return data;
    }
}