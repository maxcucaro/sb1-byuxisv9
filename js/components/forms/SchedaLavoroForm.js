export class SchedaLavoroForm {
    constructor(formElement) {
        this.form = formElement;
        this.setupForm();
    }

    setupForm() {
        this.form.innerHTML = `
            <div class="form-group">
                <label for="nome">Nome Scheda*</label>
                <input type="text" id="nome" name="nome" required maxlength="200">
            </div>

            <div class="form-group">
                <label for="tipo_lavoro">Tipo Lavoro*</label>
                <select id="tipo_lavoro" name="tipo_lavoro" required>
                    <option value="">Seleziona tipo</option>
                </select>
            </div>

            <div class="form-group" data-field="produzione_id" style="display: none;">
                <label for="produzione_id">Produzione*</label>
                <select id="produzione_id" name="produzione_id">
                    <option value="">Seleziona produzione</option>
                </select>
            </div>

            <div class="form-group" data-field="cliente_id" style="display: none;">
                <label for="cliente_id">Cliente*</label>
                <select id="cliente_id" name="cliente_id">
                    <option value="">Seleziona cliente</option>
                </select>
            </div>

            <div class="form-group" data-field="cat_id" style="display: none;">
                <label for="cat_id">CAT*</label>
                <select id="cat_id" name="cat_id">
                    <option value="">Seleziona CAT</option>
                </select>
            </div>

            <div class="form-group" data-field="fornitore_id" style="display: none;">
                <label for="fornitore_id">Fornitore*</label>
                <select id="fornitore_id" name="fornitore_id">
                    <option value="">Seleziona fornitore</option>
                </select>
            </div>

            <div class="form-group">
                <label for="data_inizio">Data Inizio*</label>
                <input type="date" id="data_inizio" name="data_inizio" required>
            </div>

            <div class="form-group">
                <label for="data_fine">Data Fine*</label>
                <input type="date" id="data_fine" name="data_fine" required>
            </div>

            <div class="form-group">
                <label for="luogo">Luogo*</label>
                <input type="text" id="luogo" name="luogo" required maxlength="200">
            </div>

            <div class="form-group">
                <label for="responsabile_id">Responsabile</label>
                <select id="responsabile_id" name="responsabile_id">
                    <option value="">Seleziona responsabile</option>
                </select>
            </div>

            <div class="form-group">
                <label for="note">Note</label>
                <textarea id="note" name="note" rows="4" maxlength="1000"></textarea>
            </div>

            <div class="form-actions">
                <button type="submit" class="button">Salva</button>
                <button type="button" onclick="history.back()" class="button">Annulla</button>
            </div>
        `;
    }

    validate() {
        const formData = this.getFormData();
        
        if (!formData.nome?.trim()) {
            throw new Error('Il nome della scheda è obbligatorio');
        }
        if (!formData.tipo_lavoro) {
            throw new Error('Il tipo di lavoro è obbligatorio');
        }
        if (!formData.data_inizio) {
            throw new Error('La data di inizio è obbligatoria');
        }
        if (!formData.data_fine) {
            throw new Error('La data di fine è obbligatoria');
        }
        if (!formData.luogo?.trim()) {
            throw new Error('Il luogo è obbligatorio');
        }

        const inizio = new Date(formData.data_inizio);
        const fine = new Date(formData.data_fine);
        if (inizio > fine) {
            throw new Error('La data di inizio non può essere successiva alla data di fine');
        }

        return true;
    }

    getFormData() {
        return Object.fromEntries(new FormData(this.form));
    }

    reset() {
        this.form.reset();
    }
}