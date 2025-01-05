import { BaseModal } from '../components/modal/BaseModal.js';
import { FornitoreForm } from '../components/forms/FornitoreForm.js';

export function createFornitoreModal() {
    const modalHTML = `
        <div id="fornitoreModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Gestione Fornitore</h3>
                <form id="fornitoreForm">
                    <div class="form-group">
                        <label for="ragione_sociale">Ragione Sociale*</label>
                        <input type="text" id="ragione_sociale" name="ragione_sociale" required>
                    </div>

                    <div class="form-group">
                        <label for="partita_iva">Partita IVA</label>
                        <input type="text" id="partita_iva" name="partita_iva">
                    </div>

                    <div class="form-group">
                        <label for="codice_fiscale">Codice Fiscale</label>
                        <input type="text" id="codice_fiscale" name="codice_fiscale">
                    </div>

                    <div class="form-group">
                        <label for="indirizzo">Indirizzo</label>
                        <input type="text" id="indirizzo" name="indirizzo">
                    </div>

                    <div class="form-group">
                        <label for="cap">CAP</label>
                        <input type="text" id="cap" name="cap">
                    </div>

                    <div class="form-group">
                        <label for="citta">Città</label>
                        <input type="text" id="citta" name="citta">
                    </div>

                    <div class="form-group">
                        <label for="provincia">Provincia</label>
                        <input type="text" id="provincia" name="provincia">
                    </div>

                    <div class="form-group">
                        <label for="telefono">Telefono</label>
                        <input type="text" id="telefono" name="telefono">
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email">
                    </div>

                    <div class="form-group">
                        <label for="pec">PEC</label>
                        <input type="email" id="pec" name="pec">
                    </div>

                    <div class="form-group">
                        <label for="sdi">Codice SDI</label>
                        <input type="text" id="sdi" name="sdi">
                    </div>

                    <div class="form-group">
                        <label for="note">Note</label>
                        <textarea id="note" name="note" rows="3"></textarea>
                    </div>

                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="attivo" name="attivo" checked>
                            Fornitore attivo
                        </label>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="button">Salva</button>
                        <button type="button" class="button" onclick="document.getElementById('fornitoreModal').style.display='none'">Annulla</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Remove existing modal if present
    const existingModal = document.getElementById('fornitoreModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    return new BaseModal('fornitoreModal');
}