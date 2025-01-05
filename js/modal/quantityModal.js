export function createQuantityModal() {
    const modalHTML = `
        <div id="quantityModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Modifica Quantità</h3>
                <form id="quantityForm">
                    <div class="form-group">
                        <label for="nuovaQuantita">Nuova Quantità</label>
                        <input type="number" id="nuovaQuantita" name="nuovaQuantita" required min="0">
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="button">Salva</button>
                        <button type="button" class="button" onclick="document.getElementById('quantityModal').style.display='none'">Annulla</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}