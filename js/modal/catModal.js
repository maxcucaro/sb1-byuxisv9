import { BaseModal } from '../components/modal/BaseModal.js';
import { CatForm } from '../components/forms/CatForm.js';

export function createCatModal() {
    // Remove existing modal if present
    const existingModal = document.getElementById('catModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modalHTML = `
        <div id="catModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Gestione CAT</h3>
                <form id="catForm">
                    <div class="form-group">
                        <label for="nome">Nome*</label>
                        <input type="text" id="nome" name="nome" required maxlength="100">
                    </div>
                    <div class="form-group">
                        <label for="cognome">Cognome*</label>
                        <input type="text" id="cognome" name="cognome" required maxlength="100">
                    </div>
                    <div class="form-group">
                        <label for="codice_fiscale">Codice Fiscale</label>
                        <input type="text" id="codice_fiscale" name="codice_fiscale" maxlength="16">
                    </div>
                    <div class="form-group">
                        <label for="partita_iva">Partita IVA</label>
                        <input type="text" id="partita_iva" name="partita_iva" maxlength="11">
                    </div>
                    <div class="form-group">
                        <label for="indirizzo">Indirizzo</label>
                        <input type="text" id="indirizzo" name="indirizzo" maxlength="200">
                    </div>
                    <div class="form-group">
                        <label for="telefono">Telefono</label>
                        <input type="tel" id="telefono" name="telefono" maxlength="20">
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" maxlength="100">
                    </div>
                    <div class="form-group">
                        <label for="specializzazione">Specializzazione</label>
                        <input type="text" id="specializzazione" name="specializzazione" maxlength="100">
                    </div>
                    <div class="form-group">
                        <label for="note">Note</label>
                        <textarea id="note" name="note" rows="3" maxlength="500"></textarea>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="attivo" name="attivo" checked>
                            CAT attivo
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="button">Salva</button>
                        <button type="button" class="button" onclick="document.getElementById('catModal').style.display='none'">Annulla</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    return new BaseModal('catModal');
}