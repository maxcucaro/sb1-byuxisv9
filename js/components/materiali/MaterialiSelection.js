import { SETTORI } from '../../utils/constants.js';
import { articoliService } from '../../services/articoliService.js';

export async function displayMaterialiSelection(container) {
    let html = `
        <div class="materiali-selection">
            <div class="search-section">
                <div class="form-group">
                    <label for="settore">Settore</label>
                    <select id="settore" name="settore">
                        <option value="">Seleziona settore</option>
                        ${Object.entries(SETTORI).map(([key, value]) => `
                            <option value="${key}">${value.nome}</option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label for="searchInput">Cerca Articolo</label>
                    <input type="text" id="searchInput" placeholder="Cerca per codice, descrizione..." disabled>
                </div>
            </div>

            <div id="searchResults" class="search-results"></div>

            <div class="selected-items">
                <h4>Articoli Selezionati</h4>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Settore</th>
                                <th>Codice</th>
                                <th>Descrizione</th>
                                <th>Quantità</th>
                                <th>Note</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody id="selectedItemsTable">
                            <tr>
                                <td colspan="6" class="no-data">Nessun articolo selezionato</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Setup event handlers
    const settoreSelect = document.getElementById('settore');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const selectedItemsTable = document.getElementById('selectedItemsTable');

    let currentArticoli = [];
    let selectedItems = new Map();

    settoreSelect.addEventListener('change', async () => {
        const settore = settoreSelect.value;
        searchInput.disabled = !settore;
        searchInput.value = '';
        searchResults.innerHTML = '';
        
        if (settore) {
            try {
                const result = await articoliService.getArticoli(settore);
                if (result.success) {
                    currentArticoli = result.data;
                }
            } catch (error) {
                console.error('Errore caricamento articoli:', error);
                searchResults.innerHTML = `
                    <div class="error-message">
                        Errore durante il caricamento degli articoli: ${error.message}
                    </div>`;
            }
        }
    });

    searchInput.addEventListener('input', (e) => {
        const searchText = e.target.value.toLowerCase();
        if (searchText.length < 2) {
            searchResults.innerHTML = '';
            return;
        }

        const filteredArticoli = currentArticoli.filter(art => 
            art.cod.toLowerCase().includes(searchText) ||
            art.descrizione.toLowerCase().includes(searchText) ||
            art.categoria.toLowerCase().includes(searchText)
        ).slice(0, 10); // Limit results

        searchResults.innerHTML = filteredArticoli.map(art => `
            <div class="search-result-item" data-articolo='${JSON.stringify(art)}'>
                <div class="articolo-info">
                    <span class="articolo-cod">${art.cod}</span>
                    <span class="articolo-desc">${art.descrizione}</span>
                    <span class="articolo-cat">${art.categoria}</span>
                </div>
                <button class="button add-button">Aggiungi</button>
            </div>
        `).join('') || '<div class="no-results">Nessun risultato trovato</div>';
    });

    searchResults.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-button')) {
            const item = e.target.closest('.search-result-item');
            const articolo = JSON.parse(item.dataset.articolo);
            
            if (!selectedItems.has(articolo.cod)) {
                selectedItems.set(articolo.cod, {
                    settore: settoreSelect.value,
                    ...articolo,
                    quantita: 1,
                    note: ''
                });
                updateSelectedItemsTable();
            }
        }
    });

    function updateSelectedItemsTable() {
        if (selectedItems.size === 0) {
            selectedItemsTable.innerHTML = `
                <tr>
                    <td colspan="6" class="no-data">Nessun articolo selezionato</td>
                </tr>`;
            return;
        }

        selectedItemsTable.innerHTML = Array.from(selectedItems.values()).map(item => `
            <tr>
                <td>${SETTORI[item.settore].nome}</td>
                <td>${item.cod}</td>
                <td>${item.descrizione}</td>
                <td>
                    <input type="number" 
                        class="quantity-input" 
                        value="${item.quantita}"
                        min="1"
                        onchange="window.updateQuantita('${item.cod}', this.value)"
                    >
                </td>
                <td>
                    <input type="text" 
                        class="note-input"
                        value="${item.note}"
                        placeholder="Note..."
                        onchange="window.updateNote('${item.cod}', this.value)"
                    >
                </td>
                <td>
                    <button class="button remove-button" 
                        onclick="window.removeItem('${item.cod}')">
                        Rimuovi
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Global handlers
    window.updateQuantita = (cod, value) => {
        const item = selectedItems.get(cod);
        if (item) {
            item.quantita = parseInt(value) || 1;
        }
    };

    window.updateNote = (cod, value) => {
        const item = selectedItems.get(cod);
        if (item) {
            item.note = value;
        }
    };

    window.removeItem = (cod) => {
        selectedItems.delete(cod);
        updateSelectedItemsTable();
    };

    // Return API for parent components
    return {
        getSelectedItems: () => Array.from(selectedItems.values()),
        clearSelection: () => {
            selectedItems.clear();
            updateSelectedItemsTable();
        }
    };
}