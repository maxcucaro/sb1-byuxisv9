import { populateSelect } from '../utils/formUtils.js';

export function createAttrezzatureSchedaModal() {
    const modalHTML = `
        <div id="attrezzatureSchedaModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Gestione Attrezzature Scheda</h3>
                <form id="attrezzatureSchedaForm">
                    <div class="form-group">
                        <label for="settore">Settore*</label>
                        <select id="settore" name="settore" required>
                            <option value="">Seleziona settore</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="articolo_cod">Articolo*</label>
                        <select id="articolo_cod" name="articolo_cod" required>
                            <option value="">Seleziona articolo</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="quantita">Quantità*</label>
                        <input type="number" id="quantita" name="quantita" min="1" required>
                    </div>
                    <div class="form-group">
                        <label for="note">Note</label>
                        <textarea id="note" name="note" rows="3"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="button">Aggiungi</button>
                        <button type="button" class="button" onclick="document.getElementById('attrezzatureSchedaModal').style.display='none'">Annulla</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}