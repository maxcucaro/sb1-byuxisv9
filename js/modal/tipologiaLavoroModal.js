export function createTipologiaModal() {
    // Remove existing modal if present
    const existingModal = document.getElementById('tipologiaModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modalHTML = `
        <div id="tipologiaModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Configurazione Tipologia Lavoro</h3>
                <form id="tipologiaForm">
                    <input type="hidden" id="tipo" name="tipo">
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="attivo" name="attivo" checked>
                            Tipologia attiva
                        </label>
                    </div>

                    <div class="form-group">
                        <label>Requisiti:</label>
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="richiedi_cliente" name="richiedi_cliente">
                                Richiedi cliente
                            </label>
                            <label>
                                <input type="checkbox" id="richiedi_preventivo" name="richiedi_preventivo">
                                Richiedi preventivo
                            </label>
                            <label>
                                <input type="checkbox" id="richiedi_ddt" name="richiedi_ddt">
                                Richiedi DDT
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="note">Note</label>
                        <textarea id="note" name="note" rows="3" maxlength="500"></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="button">Salva</button>
                        <button type="button" onclick="document.getElementById('tipologiaModal').style.display='none'" class="button">Annulla</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}