export function createMezzoModal() {
    const modalHTML = `
        <div id="mezzoModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Gestione Mezzo di Trasporto</h3>
                <form id="mezzoForm">
                    <div class="form-group">
                        <label for="tipo">Tipo*</label>
                        <select id="tipo" name="tipo" required>
                            <option value="">Seleziona tipo</option>
                            <option value="FURGONE">Furgone</option>
                            <option value="CAMION">Camion</option>
                            <option value="BILICO">Bilico</option>
                            <option value="AUTO">Auto</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="marca">Marca*</label>
                        <input type="text" id="marca" name="marca" required>
                    </div>
                    <div class="form-group">
                        <label for="modello">Modello*</label>
                        <input type="text" id="modello" name="modello" required>
                    </div>
                    <div class="form-group">
                        <label for="targa">Targa*</label>
                        <input type="text" id="targa" name="targa" required>
                    </div>
                    <div class="form-group">
                        <label for="portata">Portata (kg)</label>
                        <input type="number" id="portata" name="portata" step="0.1" min="0">
                    </div>
                    <div class="form-group">
                        <label for="dimensioni">Dimensioni (LxPxH cm)</label>
                        <input type="text" id="dimensioni" name="dimensioni" placeholder="Es: 400x200x220">
                    </div>
                    <div class="form-group">
                        <label for="note">Note</label>
                        <textarea id="note" name="note" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="attivo" name="attivo" checked>
                            Mezzo attivo
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="button">Salva</button>
                        <button type="button" class="button" onclick="document.getElementById('mezzoModal').style.display='none'">Annulla</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Rimuovi il modal esistente se presente
    const existingModal = document.getElementById('mezzoModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Aggiungi il nuovo modal al body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}