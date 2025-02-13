import { ruoliService } from '../services/ruoliService.js';

async function populateRuoliSelect(selectElement) {
    try {
        const result = await ruoliService.getRuoli();
        if (!result.success) throw new Error(result.error);

        selectElement.innerHTML = '<option value="">Seleziona ruolo</option>';
        result.data.forEach(ruolo => {
            const option = document.createElement('option');
            option.value = ruolo.nome;
            option.textContent = ruolo.nome;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error('Errore nel caricamento dei ruoli:', error);
        selectElement.innerHTML = '<option value="">Errore caricamento ruoli</option>';
    }
}

export async function createDipendenteModal() {
    const modalHTML = `
        <div id="dipendenteModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Gestione Dipendente</h3>
                <form id="dipendenteForm">
                    <div class="form-group">
                        <label for="nome">Nome*</label>
                        <input type="text" id="nome" name="nome" required>
                    </div>
                    <div class="form-group">
                        <label for="cognome">Cognome*</label>
                        <input type="text" id="cognome" name="cognome" required>
                    </div>
                    <div class="form-group">
                        <label for="ruolo">Ruolo*</label>
                        <select id="ruolo" name="ruolo" required>
                            <option value="">Seleziona ruolo</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="telefono">Telefono</label>
                        <input type="tel" id="telefono" name="telefono">
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email">
                    </div>
                    <div class="form-group">
                        <label for="indirizzo">Indirizzo</label>
                        <input type="text" id="indirizzo" name="indirizzo">
                    </div>
                    <div class="form-group">
                        <label for="note">Note</label>
                        <textarea id="note" name="note" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="attivo" name="attivo" checked>
                            Dipendente attivo
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="button">Salva</button>
                        <button type="button" onclick="document.getElementById('dipendenteModal').style.display='none'" class="button">Annulla</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Remove existing modal if present
    const existingModal = document.getElementById('dipendenteModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Populate ruoli select after modal is created
    const ruoloSelect = document.getElementById('ruolo');
    await populateRuoliSelect(ruoloSelect);
}