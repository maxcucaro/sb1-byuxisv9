import { populateSelect } from '../utils/formUtils.js';

export function createImballiSchedaModal() {
    const modalHTML = `
        <div id="imballiSchedaModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Gestione Imballi Scheda</h3>
                <form id="imballiSchedaForm">
                    <div class="form-group">
                        <label for="imballo_id">Imballo*</label>
                        <select id="imballo_id" name="imballo_id" required>
                            <option value="">Seleziona imballo</option>
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
                        <button type="button" class="button" onclick="document.getElementById('imballiSchedaModal').style.display='none'">Annulla</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}