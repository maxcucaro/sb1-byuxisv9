import { SETTORI } from '../utils/constants.js';
import { articoliService } from '../services/articoliService.js';
import { kitService } from '../services/kitService.js';

export function createKitModal() {
    // Rimuovi il modale esistente se presente
    const existingModal = document.getElementById('kitModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modalHTML = `
        <div id="kitModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>GESTIONE KIT</h3>
                    <span class="modal-close">&times;</span>
                </div>
                <form id="kitForm">
                    <input type="hidden" id="isEdit" name="isEdit" value="false">
                    
                    <div class="form-section">
                        <h4>Dati Principali</h4>
                        <div class="form-group">
                            <label for="settore" class="required-field">Settore</label>
                            <select id="settore" name="settore" required>
                                <option value="">Seleziona settore</option>
                                ${Object.entries(SETTORI).map(([key, value]) => `
                                    <option value="${key}">${value.nome}</option>
                                `).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="articolo" class="required-field">Articolo Principale</label>
                            <div class="article-search">
                                <input type="text" id="searchArticolo" placeholder="Cerca articolo" class="search-input">
                                <select id="articolo" name="articolo" required disabled>
                                    <option value="">Seleziona articolo</option>
                                </select>
                            </div>
                            <div class="selected-article" style="display: none;">
                                <span class="article-info"></span>
                            </div>
                            <input type="hidden" id="articolo_cod" name="articolo_cod">
                        </div>

                        <div class="form-group">
                            <label for="nome" class="required-field">Nome Kit</label>
                            <input type="text" id="nome" name="nome" required>
                        </div>

                        <div class="form-group">
                            <label for="descrizione">Descrizione</label>
                            <textarea id="descrizione" name="descrizione" rows="3"></textarea>
                        </div>

                        <div class="form-group">
                            <label for="quantita_kit" class="required-field">Quantità Kit</label>
                            <div class="quantity-control">
                                <button type="button" class="quantity-btn minus">-</button>
                                <input type="number" id="quantita_kit" name="quantita_kit" min="1" value="1" required>
                                <button type="button" class="quantity-btn plus">+</button>
                            </div>
                            <small class="help-text">Numero di kit da creare</small>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>Componenti</h4>
                        <div id="componentList" class="component-list"></div>
                        <button type="button" class="button add-component-btn" id="addComponentBtn">
                            Aggiungi Componente
                        </button>
                    </div>

                    <div class="form-group">
                        <label for="note">Note</label>
                        <textarea id="note" name="note" rows="3"></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="button primary-button">Salva</button>
                        <button type="button" class="button secondary-button cancel-button">Annulla</button>
                    </div>
                </form>
            </div>
        </div>

        <style>
            .modal-header {
                background: var(--primary-color);
                color: white;
                padding: 1.25rem;
                border-radius: 0.5rem 0.5rem 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .modal-header h3 {
                margin: 0;
                font-size: 1.25rem;
                font-weight: 600;
            }

            .modal-close {
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                transition: opacity 0.2s;
            }

            .modal-close:hover {
                opacity: 0.8;
            }

            .form-section {
                margin-bottom: 2rem;
                padding: 1.5rem;
                background: #f8fafc;
                border-radius: 0.5rem;
            }

            .form-section h4 {
                margin: 0 0 1.5rem 0;
                color: var(--text-color);
                font-size: 1.1rem;
                padding-bottom: 0.5rem;
                border-bottom: 2px solid var(--accent-color);
            }

            .article-search {
                display: flex;
                gap: 1rem;
                margin-bottom: 0.5rem;
            }

            .search-input {
                flex: 1;
                padding: 0.75rem;
                border: 1px solid var(--border-color);
                border-radius: 0.375rem;
                font-size: 0.875rem;
            }

            .selected-article {
                background: #f8fafc;
                padding: 0.75rem;
                border-radius: 0.375rem;
                margin-top: 0.5rem;
            }

            .article-info {
                font-weight: 500;
                color: var(--text-color);
            }

            .quantity-control {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                max-width: 200px;
            }

            .quantity-btn {
                padding: 0.5rem 1rem;
                border: 1px solid var(--border-color);
                background: white;
                border-radius: 0.375rem;
                cursor: pointer;
                transition: all 0.2s;
            }

            .quantity-btn:hover {
                background: var(--background-color);
            }

            .quantity-input {
                width: 80px;
                text-align: center;
                padding: 0.5rem;
                border: 1px solid var(--border-color);
                border-radius: 0.375rem;
            }

            .component-list {
                margin-bottom: 1rem;
                max-height: 400px;
                overflow-y: auto;
            }

            .component-item {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr 100px auto;
                gap: 1rem;
                align-items: center;
                background: white;
                padding: 1rem;
                border-radius: 0.375rem;
                margin-bottom: 0.5rem;
                animation: slideIn 0.3s ease;
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .component-item select,
            .component-item input {
                width: 100%;
                padding: 0.5rem;
                border: 1px solid var(--border-color);
                border-radius: 0.25rem;
            }

            .remove-button {
                background-color: #ef4444 !important;
                color: white !important;
                padding: 0.5rem 1rem !important;
            }

            .remove-button:hover {
                background-color: #dc2626 !important;
            }

            .add-component-btn {
                width: 100%;
                margin-top: 0.5rem;
            }

            .help-text {
                display: block;
                margin-top: 0.25rem;
                font-size: 0.875rem;
                color: #6B7280;
            }

            .required-field::after {
                content: "*";
                color: #ef4444;
                margin-left: 0.25rem;
            }

            .primary-button {
                background: var(--accent-color);
                color: white;
            }

            .primary-button:hover {
                background: #0284C7;
            }

            .secondary-button {
                background: #E5E7EB;
                color: var(--text-color);
            }

            .secondary-button:hover {
                background: #D1D5DB;
            }

            @media (max-width: 768px) {
                .component-item {
                    grid-template-columns: 1fr;
                    gap: 0.5rem;
                }
            }
        </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('kitModal');

    // Setup form handlers
    setupFormHandlers(modal);

    return modal;
}

function setupFormHandlers(modal) {
    const form = modal.querySelector('#kitForm');
    const settoreSelect = form.querySelector('#settore');
    const articoloSelect = form.querySelector('#articolo');
    const searchInput = form.querySelector('#searchArticolo');
    const quantityInput = form.querySelector('#quantita_kit');
    const addComponentBtn = form.querySelector('#addComponentBtn');
    const componentList = form.querySelector('#componentList');

    // Setup quantity controls
    const minusBtn = form.querySelector('.quantity-btn.minus');
    const plusBtn = form.querySelector('.quantity-btn.plus');

    minusBtn.onclick = () => {
        const value = parseInt(quantityInput.value) || 1;
        if (value > 1) {
            quantityInput.value = value - 1;
        }
    };

    plusBtn.onclick = () => {
        const value = parseInt(quantityInput.value) || 1;
        quantityInput.value = value + 1;
    };

    // Setup settore change handler
    settoreSelect.onchange = async () => {
        const settore = settoreSelect.value;
        articoloSelect.innerHTML = '<option value="">Seleziona articolo</option>';
        articoloSelect.disabled = !settore;
        searchInput.disabled = !settore;
        searchInput.value = '';

        if (settore) {
            try {
                const result = await articoliService.getArticoli(settore);
                if (!result.success) throw new Error(result.error);

                result.data
                    .filter(a => a.attivo)
                    .sort((a, b) => a.descrizione.localeCompare(b.descrizione))
                    .forEach(articolo => {
                        const option = document.createElement('option');
                        option.value = articolo.cod;
                        option.textContent = `${articolo.cod} - ${articolo.descrizione}`;
                        option.dataset.articolo = JSON.stringify(articolo);
                        articoloSelect.appendChild(option);
                    });

                articoloSelect.disabled = false;
            } catch (error) {
                console.error('Errore caricamento articoli:', error);
                alert('Errore durante il caricamento degli articoli: ' + error.message);
            }
        }
    };

    // Setup article search
    searchInput.oninput = () => {
        const searchText = searchInput.value.toLowerCase();
        Array.from(articoloSelect.options).forEach(option => {
            if (option.value) { // Skip placeholder option
                const text = option.textContent.toLowerCase();
                option.style.display = text.includes(searchText) ? '' : 'none';
            }
        });
    };

    // Setup article selection
    articoloSelect.onchange = () => {
        const selectedOption = articoloSelect.selectedOptions[0];
        const articleInfo = document.querySelector('.selected-article');
        const articleInfoText = articleInfo.querySelector('.article-info');
        
        if (selectedOption && selectedOption.value) {
            const articolo = JSON.parse(selectedOption.dataset.articolo);
            articleInfoText.textContent = `${articolo.cod} - ${articolo.descrizione}`;
            articleInfo.style.display = 'block';
            form.articolo_cod.value = articolo.cod;
        } else {
            articleInfo.style.display = 'none';
            form.articolo_cod.value = '';
        }
    };

    // Setup component management
    addComponentBtn.onclick = () => addComponent(componentList);

    // Setup form submission
    form.onsubmit = async (e) => {
        e.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        try {
            const formData = {
                settore: settoreSelect.value,
                articolo_cod: form.articolo_cod.value,
                quantita_kit: parseInt(quantityInput.value),
                nome: form.nome.value,
                descrizione: form.descrizione.value,
                note: form.note.value,
                componenti: []
            };

            // Validate required fields
            if (!formData.settore) throw new Error('Seleziona un settore');
            if (!formData.articolo_cod) throw new Error('Seleziona un articolo');
            if (!formData.nome) throw new Error('Inserisci un nome per il kit');
            if (formData.quantita_kit < 1) throw new Error('La quantità deve essere maggiore di 0');

            // Get components
            const componentItems = componentList.querySelectorAll('.component-item');
            if (!componentItems.length) {
                throw new Error('Aggiungi almeno un componente al kit');
            }

            componentItems.forEach(item => {
                const settore = item.querySelector('[name="componente_settore"]').value;
                const cod = item.querySelector('[name="componente_cod"]').value;
                const quantita = parseInt(item.querySelector('[name="quantita"]').value);
                const note = item.querySelector('[name="note"]').value;

                if (!settore || !cod || !quantita) {
                    throw new Error('Completa tutti i campi dei componenti');
                }

                formData.componenti.push({ settore, cod, quantita, note });
            });

            // Save kit
            const result = form.isEdit.value === 'true'
                ? await kitService.updateKit(formData.settore, formData.articolo_cod, formData)
                : await kitService.createKit(formData);

            if (!result.success) throw new Error(result.error);

            modal.style.display = 'none';
            if (typeof window.loadKit === 'function') {
                await window.loadKit();
            }

        } catch (error) {
            alert('Errore durante il salvataggio: ' + error.message);
        } finally {
            submitButton.disabled = false;
        }
    };

    // Setup close handlers
    const closeModal = () => {
        modal.style.display = 'none';
        form.reset();
        componentList.innerHTML = '';
    };

    modal.querySelector('.modal-close').onclick = closeModal;
    modal.querySelector('.cancel-button').onclick = closeModal;
    window.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
}

async function addComponent(container, initialData = null) {
    const index = container.children.length;
    const componentHTML = `
        <div class="component-item" data-index="${index}">
            <select name="componente_settore" required>
                <option value="">Seleziona settore</option>
                ${Object.entries(SETTORI).map(([key, value]) => `
                    <option value="${key}">${value.nome}</option>
                `).join('')}
            </select>
            <input type="text" name="search_articolo" placeholder="Cerca articolo" class="search-input">
            <select name="componente_cod" required disabled>
                <option value="">Seleziona articolo</option>
            </select>
            <input type="number" name="quantita" placeholder="Quantità" min="1" required>
            <input type="text" name="note" placeholder="Note">
            <button type="button" class="button remove-button">Rimuovi</button>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', componentHTML);
    const newComponent = container.lastElementChild;

    // Setup component handlers
    setupComponentHandlers(newComponent);

    // Populate initial data if provided
    if (initialData) {
        const settoreSelect = newComponent.querySelector('[name="componente_settore"]');
        const codSelect = newComponent.querySelector('[name="componente_cod"]');
        const quantitaInput = newComponent.querySelector('[name="quantita"]');
        const noteInput = newComponent.querySelector('[name="note"]');

        settoreSelect.value = initialData.settore;
        if (initialData.quantita) quantitaInput.value = initialData.quantita;
        if (initialData.note) noteInput.value = initialData.note;

        // Load articles for the sector
        if (initialData.settore) {
            await loadArticoliForComponent(settoreSelect, codSelect, initialData.cod);
        }
    }

    // Setup remove handler
    newComponent.querySelector('.remove-button').onclick = () => {
        newComponent.style.opacity = '0';
        setTimeout(() => newComponent.remove(), 300);
    };
}

async function setupComponentHandlers(componentItem) {
    const settoreSelect = componentItem.querySelector('[name="componente_settore"]');
    const codSelect = componentItem.querySelector('[name="componente_cod"]');
    const searchInput = componentItem.querySelector('[name="search_articolo"]');

    // Setup settore change handler
    settoreSelect.onchange = () => loadArticoliForComponent(settoreSelect, codSelect);

    // Setup search handler
    searchInput.oninput = () => {
        const searchText = searchInput.value.toLowerCase();
        Array.from(codSelect.options).forEach(option => {
            if (option.value) {
                const text = option.textContent.toLowerCase();
                option.style.display = text.includes(searchText) ? '' : 'none';
            }
        });
    };
}

async function loadArticoliForComponent(settoreSelect, codSelect, initialCod = null) {
    codSelect.innerHTML = '<option value="">Seleziona articolo</option>';
    codSelect.disabled = true;

    if (settoreSelect.value) {
        try {
            const result = await articoliService.getArticoli(settoreSelect.value);
            if (result.success) {
                result.data
                    .filter(a => a.attivo)
                    .sort((a, b) => a.descrizione.localeCompare(b.descrizione))
                    .forEach(articolo => {
                        const option = document.createElement('option');
                        option.value = articolo.cod;
                        option.textContent = `${articolo.cod} - ${articolo.descrizione}`;
                        codSelect.appendChild(option);
                    });

                codSelect.disabled = false;
                if (initialCod) codSelect.value = initialCod;
            }
        } catch (error) {
            console.error('Errore caricamento articoli:', error);
        }
    }
}

export async function setupKitModal(kit, isEdit = false) {
    const modal = createKitModal();
    const form = modal.querySelector('#kitForm');
    
    if (!form) {
        console.error('Form non trovato nel modale');
        return null;
    }

    // Set edit mode
    form.isEdit.value = isEdit;
    
    if (kit) {
        // Populate form with kit data
        form.settore.value = kit.settore;
        form.settore.disabled = isEdit;
        
        form.articolo_cod.value = kit.articolo_cod;
        form.nome.value = kit.nome;
        form.quantita_kit.value = kit.quantita_kit || 1;
        form.descrizione.value = kit.descrizione || '';
        form.note.value = kit.note || '';

        // Add components
        const componentList = form.querySelector('#componentList');
        if (kit.kit_componenti?.length) {
            for (const comp of kit.kit_componenti) {
                await addComponent(componentList, {
                    settore: comp.componente_settore,
                    cod: comp.componente_cod,
                    quantita: comp.quantita,
                    note: comp.note
                });
            }
        }
    }

    return modal;
}