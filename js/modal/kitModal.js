```javascript
import { SETTORI } from '../utils/constants.js';
import { articoliService } from '../services/articoliService.js';
import { kitService } from '../services/kitService.js';

export function createKitModal() {
    // Remove existing modal if present
    const existingModal = document.getElementById('kitModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modalHTML = `
        <div id="kitModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Gestione Kit</h3>
                <form id="kitForm">
                    <input type="hidden" id="isEdit" name="isEdit" value="false">
                    
                    <div class="form-group">
                        <label for="settore">Settore*</label>
                        <select id="settore" name="settore" required>
                            <option value="">Seleziona settore</option>
                            ${Object.entries(SETTORI).map(([key, value]) => `
                                <option value="${key}">${value.nome}</option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="articolo">Articolo*</label>
                        <input type="text" id="searchArticolo" placeholder="Cerca articolo">
                        <select id="articolo" name="articolo" required disabled>
                            <option value="">Seleziona articolo</option>
                        </select>
                        <input type="hidden" id="articolo_cod" name="articolo_cod">
                    </div>

                    <div class="form-group">
                        <label for="quantita_kit">Quantità Kit*</label>
                        <input type="number" id="quantita_kit" name="quantita_kit" min="1" value="1" required>
                        <small class="help-text">Numero di kit da creare</small>
                    </div>

                    <div class="form-group">
                        <label for="nome">Nome Kit*</label>
                        <input type="text" id="nome" name="nome" required>
                    </div>

                    <div class="form-group">
                        <label for="descrizione">Descrizione</label>
                        <textarea id="descrizione" name="descrizione" rows="3"></textarea>
                    </div>

                    <div class="form-group">
                        <label>Componenti*</label>
                        <div id="componentList"></div>
                        <button type="button" class="button" id="addComponentBtn">
                            Aggiungi Componente
                        </button>
                    </div>

                    <div class="form-group">
                        <label for="note">Note</label>
                        <textarea id="note" name="note" rows="3"></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="button">Salva</button>
                        <button type="button" class="button cancel-button">Annulla</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('kitModal');
    const form = modal.querySelector('#kitForm');
    const settoreSelect = form.querySelector('#settore');
    const articoloSelect = form.querySelector('#articolo');
    const articoloCodInput = form.querySelector('#articolo_cod');
    const isEditInput = form.querySelector('#isEdit');
    const searchArticoloInput = form.querySelector('#searchArticolo');
    const componentList = form.querySelector('#componentList');
    const addComponentBtn = form.querySelector('#addComponentBtn');

    // Setup settore change handler
    settoreSelect.addEventListener('change', async () => {
        if (isEditInput.value === 'true') return;

        articoloSelect.innerHTML = '<option value="">Seleziona articolo</option>';
        articoloSelect.disabled = true;
        articoloCodInput.value = '';

        if (settoreSelect.value) {
            try {
                const result = await articoliService.getArticoli(settoreSelect.value);
                if (result.success) {
                    const sortedArticoli = result.data
                        .filter(a => a.attivo)
                        .sort((a, b) => a.descrizione.localeCompare(b.descrizione));
                        
                    sortedArticoli.forEach(articolo => {
                        const option = document.createElement('option');
                        option.value = articolo.cod;
                        option.textContent = `${articolo.cod} - ${articolo.descrizione}`;
                        articoloSelect.appendChild(option);
                    });
                    articoloSelect.disabled = false;
                }
            } catch (error) {
                console.error('Errore caricamento articoli:', error);
                alert('Errore durante il caricamento degli articoli: ' + error.message);
            }
        }
    });

    // Setup articolo change handler
    articoloSelect.addEventListener('change', () => {
        if (isEditInput.value === 'true') return;
        articoloCodInput.value = articoloSelect.value;
    });

    // Setup articolo search handler
    searchArticoloInput.addEventListener('input', () => {
        const searchText = searchArticoloInput.value.toLowerCase();
        Array.from(articoloSelect.options).forEach(option => {
            const text = option.textContent.toLowerCase();
            option.style.display = text.includes(searchText) ? '' : 'none';
        });
    });

    // Setup component management
    function addComponent(initialData = null) {
        const index = componentList.children.length;
        const componentHTML = `
            <div class="component-item" data-index="${index}">
                <select name="componente_settore" required>
                    <option value="">Seleziona settore</option>
                    ${Object.entries(SETTORI).map(([key, value]) => `
                        <option value="${key}">${value.nome}</option>
                    `).join('')}
                </select>
                <input type="text" name="search_articolo" placeholder="Cerca articolo">
                <select name="componente_cod" required disabled>
                    <option value="">Seleziona articolo</option>
                </select>
                <input type="number" name="quantita" placeholder="Quantità" min="1" required>
                <input type="text" name="note" placeholder="Note">
                <button type="button" onclick="rimuoviComponente(${index})" class="button remove-button">
                    Rimuovi
                </button>
            </div>
        `;

        componentList.insertAdjacentHTML('beforeend', componentHTML);
        setupComponentSelect(componentList.lastElementChild, initialData);
    }

    // Make functions globally available
    window.rimuoviComponente = (index) => {
        const item = document.querySelector(`.component-item[data-index="${index}"]`);
        if (item) item.remove();
    };

    window.aggiungiComponente = addComponent;

    addComponentBtn.addEventListener('click', () => addComponent());

    // Setup form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const formData = {
                settore: settoreSelect.value,
                articolo_cod: articoloCodInput.value || articoloSelect.value,
                quantita_kit: parseInt(form.quantita_kit.value),
                nome: form.nome.value,
                descrizione: form.descrizione.value,
                note: form.note.value,
                componenti: []
            };

            // Get components
            const componentItems = componentList.querySelectorAll('.component-item');
            componentItems.forEach(item => {
                formData.componenti.push({
                    settore: item.querySelector('[name="componente_settore"]').value,
                    cod: item.querySelector('[name="componente_cod"]').value,
                    quantita: parseInt(item.querySelector('[name="quantita"]').value),
                    note: item.querySelector('[name="note"]').value
                });
            });

            if (formData.componenti.length === 0) {
                throw new Error('Aggiungi almeno un componente al kit');
            }

            const result = isEditInput.value === 'true'
                ? await kitService.updateKit(formData.settore, formData.articolo_cod, formData)
                : await kitService.createKit(formData);

            if (result.success) {
                modal.style.display = 'none';
                if (typeof window.loadKit === 'function') {
                    await window.loadKit();
                }
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            alert('Errore durante il salvataggio: ' + error.message);
        }
    });

    // Setup close handlers
    const closeModal = () => {
        modal.style.display = 'none';
        form.reset();
        componentList.innerHTML = '';
    };

    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    modal.querySelector('.cancel-button').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    return {
        modal,
        setEditMode: (isEdit) => {
            isEditInput.value = isEdit.toString();
            settoreSelect.disabled = isEdit;
            articoloSelect.disabled = isEdit;
        }
    };
}
```