export function createImballoModal() {
    const modalHTML = `
        <div id="imballoModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Gestione Imballo</h3>
                <form id="imballoForm">
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
                        <button type="button" onclick="document.getElementById('imballoModal').style.display='none'" class="button">Annulla</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Rimuovi il modale esistente se presente
    const existingModal = document.getElementById('imballoModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Aggiungi il nuovo modale al body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Inizializza gli event handler del modale
    const modal = document.getElementById('imballoModal');
    const closeBtn = modal.querySelector('.close-modal');
    const form = modal.querySelector('#imballoForm');

    // Handler per chiusura modale
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };

    return modal;
}