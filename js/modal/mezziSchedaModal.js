import { populateSelect } from '../utils/formUtils.js';

export function createMezziSchedaModal() {
    const modalHTML = `
        <div id="mezziSchedaModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Gestione Mezzi Scheda</h3>
                <form id="mezziSchedaForm">
                    <div class="form-group">
                        <label for="mezzo_id">Mezzo*</label>
                        <select id="mezzo_id" name="mezzo_id" required>
                            <option value="">Seleziona mezzo</option>
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
                        <label for="note">Note</label>
                        <textarea id="note" name="note" rows="3"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="button">Aggiungi</button>
                        <button type="button" class="button" onclick="document.getElementById('mezziSchedaModal').style.display='none'">Annulla</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}