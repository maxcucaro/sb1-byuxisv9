import { SETTORI } from '../utils/constants.js';

export function createCategoryModal() {
    const modalHTML = `
        <div id="categoryModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Gestione Categoria</h3>
                <form id="categoryForm">
                    <div class="form-group">
                        <label for="settoreSelect">Settore*</label>
                        <select id="settoreSelect" name="settore" required>
                            <option value="">Seleziona settore</option>
                            ${Object.entries(SETTORI).map(([key, value]) => `
                                <option value="${key}">${value.nome}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="categoriaInput">Nome Categoria*</label>
                        <input type="text" id="categoriaInput" name="categoria" required 
                               placeholder="Inserisci il nome della categoria" maxlength="100">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="attivoCheck" name="attivo" checked>
                            Categoria attiva
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="button">Salva</button>
                        <button type="button" onclick="document.getElementById('categoryModal').style.display='none'" class="button">Annulla</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Rimuovi il modale esistente se presente
    const existingModal = document.getElementById('categoryModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    return document.getElementById('categoryModal');
}