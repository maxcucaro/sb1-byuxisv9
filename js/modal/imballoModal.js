export function createImballoModal() {
    const modalHTML = `
        <div id="imballoModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Gestione Imballo</h3>
                <form id="imballoForm">
                    <div class="form-group">
                        <label for="codice">Codice*</label>
                        <input type="text" id="codice" name="codice" required 
                               placeholder="Inserisci il codice dell'imballo">
                    </div>
                    <div class="form-group">
                        <label for="descrizione">Descrizione*</label>
                        <input type="text" id="descrizione" name="descrizione" required 
                               placeholder="Inserisci la descrizione">
                    </div>
                    <div class="form-group">
                        <label for="dimensioni">Dimensioni (LxPxH)</label>
                        <input type="text" id="dimensioni" name="dimensioni" 
                               placeholder="Es: 100x50x75 cm">
                    </div>
                    <div class="form-group">
                        <label for="peso">Peso (kg)</label>
                        <input type="number" id="peso" name="peso" step="0.01" 
                               placeholder="Inserisci il peso">
                    </div>
                    <div class="form-group">
                        <label for="capacita">Capacità</label>
                        <input type="text" id="capacita" name="capacita" 
                               placeholder="Es: 4 microfoni">
                    </div>
                    <div class="form-group">
                        <label for="note">Note</label>
                        <textarea id="note" name="note" rows="3" 
                                  placeholder="Inserisci eventuali note"></textarea>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="attivo" name="attivo" checked>
                            Imballo attivo
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="button">Salva</button>
                        <button type="button" class="button" onclick="document.getElementById('imballoModal').style.display='none'">Annulla</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}