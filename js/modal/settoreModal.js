export function createSettoreModal() {
    const modalHTML = `
        <div id="settoreModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Aggiungi Settore</h3>
                <form id="settoreForm">
                    <div class="form-group">
                        <label for="nomeSettore">Nome Settore*</label>
                        <input type="text" id="nomeSettore" name="nome" required 
                               placeholder="Es: Audio, Video, etc." maxlength="50">
                        <small class="help-text">Il codice settore verrà generato automaticamente</small>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="button">Salva</button>
                        <button type="button" onclick="document.getElementById('settoreModal').style.display='none'" class="button">Annulla</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const existingModal = document.getElementById('settoreModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    return document.getElementById('settoreModal');
}