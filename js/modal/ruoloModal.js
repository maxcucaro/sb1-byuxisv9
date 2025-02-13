export function createRuoloModal() {
    const modalHTML = `
        <div id="ruoloModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Modifica Ruolo</h3>
                <form id="ruoloForm">
                    <div class="form-group">
                        <label for="ruolo">Nuovo Ruolo*</label>
                        <select id="ruolo" name="ruolo" required>
                            <option value="">Seleziona ruolo</option>
                            <option value="TECNICO">Tecnico</option>
                            <option value="AMMINISTRATIVO">Amministrativo</option>
                            <option value="MAGAZZINIERE">Magazziniere</option>
                            <option value="AUTISTA">Autista</option>
                            <option value="RESPONSABILE">Responsabile</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="note_modifica">Note Modifica</label>
                        <textarea id="note_modifica" name="note_modifica" rows="3" 
                                placeholder="Inserisci eventuali note sulla modifica del ruolo"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="button">Salva</button>
                        <button type="button" class="button" onclick="document.getElementById('ruoloModal').style.display='none'">Annulla</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}