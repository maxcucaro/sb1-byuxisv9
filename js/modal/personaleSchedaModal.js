import { populateSelect } from '../utils/formUtils.js';

export function createPersonaleSchedaModal() {
    const modalHTML = `
        <div id="personaleSchedaModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Gestione Personale Scheda</h3>
                <form id="personaleSchedaForm">
                    <div class="form-group">
                        <label for="dipendente_id">Dipendente*</label>
                        <select id="dipendente_id" name="dipendente_id" required>
                            <option value="">Seleziona dipendente</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="ruolo">Ruolo*</label>
                        <select id="ruolo" name="ruolo" required>
                            <option value="">Seleziona ruolo</option>
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
                        <button type="button" class="button" onclick="document.getElementById('personaleSchedaModal').style.display='none'">Annulla</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}