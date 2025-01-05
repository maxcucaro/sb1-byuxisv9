import { BaseModal } from '../components/modal/BaseModal.js';
import { ProduzioneForm } from '../components/forms/ProduzioneForm.js';

export function createProduzioneModal() {
    const modalHTML = `
        <div id="produzioneModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Gestione Produzione</h3>
                <form id="produzioneForm">
                    <div class="form-group">
                        <label for="nome">Nome*</label>
                        <input type="text" id="nome" name="nome" required>
                    </div>
                    <div class="form-group">
                        <label for="luogo">Luogo</label>
                        <input type="text" id="luogo" name="luogo">
                    </div>
                    <div class="form-group">
                        <label for="responsabile_lavori">Responsabile Lavori</label>
                        <input type="text" id="responsabile_lavori" name="responsabile_lavori">
                    </div>
                    <div class="form-group">
                        <label for="note">Note</label>
                        <textarea id="note" name="note" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="attivo" name="attivo" checked>
                            Produzione attiva
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="button">Salva</button>
                        <button type="button" class="button" onclick="document.getElementById('produzioneModal').style.display='none'">Annulla</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    return new BaseModal('produzioneModal');
}