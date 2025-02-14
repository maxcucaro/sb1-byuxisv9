export class MaterialSearchForm {
    constructor(container) {
        this.container = container;
        this.selectedMaterials = new Map();
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="material-search-section">
                <div class="search-controls">
                    <div class="search-group">
                        <label for="settoreSelect">Settore</label>
                        <select id="settoreSelect" class="form-control">
                            <option value="">Seleziona settore</option>
                            <option value="AUDIO">Audio</option>
                            <option value="LUCI">Luci</option>
                            <option value="VIDEO">Video</option>
                            <option value="ELETTRICO">Elettrico</option>
                            <option value="SEGNALI">Segnali</option>
                            <option value="STRUTTURE">Strutture</option>
                            <option value="ALLESTIMENTO">Allestimento</option>
                            <option value="ATTREZZATURE">Attrezzature</option>
                            <option value="BACKLINE">Backline</option>
                            <option value="RIGGHERAGGIO">Riggheraggio</option>
                            <option value="GENERICO">Generico</option>
                        </select>
                    </div>
                    
                    <div class="search-group">
                        <label for="searchInput">Cerca Materiale</label>
                        <input type="text" id="searchInput" class="form-control" 
                               placeholder="Cerca per codice o descrizione..." disabled>
                    </div>
                </div>

                <div id="searchResults" class="search-results"></div>

                <div class="selected-materials">
                    <h4>Materiali Selezionati</h4>
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Settore</th>
                                    <th>Codice</th>
                                    <th>Descrizione</th>
                                    <th>Giacenza</th>
                                    <th>Disponibile</th>
                                    <th>Prevista</th>
                                    <th>Quantità</th>
                                    <th>Note</th>
                                    <th>Azioni</th>
                                </tr>
                            </thead>
                            <tbody id="selectedMaterialsTable">
                                <tr>
                                    <td colspan="9" class="no-data">Nessun materiale selezionato</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        this.setupEventHandlers();
    }

    async setupEventHandlers() {
        const settoreSelect = this.container.querySelector('#settoreSelect');
        const searchInput = this.container.querySelector('#searchInput');
        const searchResults = this.container.querySelector('#searchResults');

        settoreSelect.addEventListener('change', () => {
            searchInput.disabled = !settoreSelect.value;
            searchInput.value = '';
            searchResults.innerHTML = '';
        });

        searchInput.addEventListener('input', async () => {
            const searchText = searchInput.value.toLowerCase();
            const settore = settoreSelect.value;

            if (searchText.length < 2 || !settore) {
                searchResults.innerHTML = '';
                return;
            }

            try {
                const { data: articoli, error } = await supabase
                    .from('inventario_completo')
                    .select('*')
                    .eq('settore', settore)
                    .eq('attivo', true)
                    .or(`cod.ilike.%${searchText}%,descrizione.ilike.%${searchText}%`)
                    .order('descrizione');

                if (error) throw error;

                if (!articoli?.length) {
                    searchResults.innerHTML = '<div class="no-results">Nessun risultato trovato</div>';
                    return;
                }

                // Get availability for each article
                const results = await Promise.all(articoli.map(async (articolo) => {
                    const { data: disponibilita } = await supabase.rpc('get_giacenza_effettiva', {
                        _settore: settore,
                        _articolo_cod: articolo.cod
                    });

                    const { data: disponibilitaFutura } = await supabase.rpc('get_disponibilita_futura', {
                        _settore: settore,
                        _articolo_cod: articolo.cod,
                        _data: new Date().toISOString()
                    });

                    return {
                        ...articolo,
                        disponibilita,
                        disponibilitaFutura
                    };
                }));

                searchResults.innerHTML = results.map(item => `
                    <div class="search-result-item" data-material='${JSON.stringify(item)}'>
                        <div class="material-info">
                            <span class="material-code">${item.cod}</span>
                            <span class="material-desc">${item.descrizione}</span>
                            <span class="material-cat">${item.categoria}</span>
                            <span class="material-qty">
                                Disp: ${item.disponibilita?.quantita_disponibile || 0} / 
                                Prev: ${item.disponibilitaFutura || 0}
                            </span>
                        </div>
                        <button class="button add-button">Aggiungi</button>
                    </div>
                `).join('');

            } catch (error) {
                console.error('Errore durante la ricerca:', error);
                searchResults.innerHTML = '<div class="error-message">Errore durante la ricerca</div>';
            }
        });

        searchResults.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-button')) {
                const item = e.target.closest('.search-result-item');
                const material = JSON.parse(item.dataset.material);
                this.addMaterial(material);
            }
        });
    }

    addMaterial(material) {
        if (!this.selectedMaterials.has(material.cod)) {
            this.selectedMaterials.set(material.cod, {
                ...material,
                quantita: 1,
                note: ''
            });
            this.updateSelectedMaterialsTable();
        }
    }

    removeMaterial(cod) {
        this.selectedMaterials.delete(cod);
        this.updateSelectedMaterialsTable();
    }

    updateSelectedMaterialsTable() {
        const tableBody = this.container.querySelector('#selectedMaterialsTable');
        
        if (this.selectedMaterials.size === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="no-data">Nessun materiale selezionato</td>
                </tr>`;
            return;
        }

        tableBody.innerHTML = Array.from(this.selectedMaterials.values()).map(material => `
            <tr>
                <td>${SETTORI[material.settore]?.nome || material.settore}</td>
                <td>${material.cod}</td>
                <td>${material.descrizione}</td>
                <td>${material.quantita}</td>
                <td class="${material.disponibilita?.quantita_disponibile < 0 ? 'quantita-negativa' : ''}">
                    ${material.disponibilita?.quantita_disponibile || 0}
                </td>
                <td class="${material.disponibilitaFutura < 0 ? 'quantita-negativa' : ''}">
                    ${material.disponibilitaFutura || 0}
                </td>
                <td>
                    <input type="number" 
                        class="quantity-input" 
                        value="${material.quantita}"
                        min="1"
                        onchange="window.materialSearchForm.updateQuantity('${material.cod}', this.value)"
                    >
                </td>
                <td>
                    <input type="text" 
                        class="note-input"
                        value="${material.note}"
                        placeholder="Note..."
                        onchange="window.materialSearchForm.updateNote('${material.cod}', this.value)"
                    >
                </td>
                <td>
                    <button onclick="window.materialSearchForm.removeMaterial('${material.cod}')" class="button remove-button">
                        Rimuovi
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateQuantity(cod, value) {
        const material = this.selectedMaterials.get(cod);
        if (material) {
            material.quantita = parseInt(value) || 1;
            this.selectedMaterials.set(cod, material);
        }
    }

    updateNote(cod, value) {
        const material = this.selectedMaterials.get(cod);
        if (material) {
            material.note = value;
            this.selectedMaterials.set(cod, material);
        }
    }

    getSelectedMaterials() {
        return Array.from(this.selectedMaterials.values()).map(material => ({
            settore: material.settore,
            cod: material.cod,
            quantita: material.quantita,
            note: material.note
        }));
    }
}