```javascript
import { SETTORI } from '../../utils/constants.js';
import { inventoryCache } from './InventoryCache.js';
import { supabase } from '../../utils/supabaseClient.js';

export async function displayMaterialiRichiesta(container, schedaId, dataInizio) {
    try {
        const settore = document.getElementById('settoreFilter').value;
        if (!settore) {
            container.innerHTML = '<p class="no-data">Seleziona un settore per visualizzare gli articoli</p>';
            return;
        }

        // Get articles from cache
        const articoli = await inventoryCache.getArticoliBySector(settore);

        // Group by category
        const articoliByCategoria = {};
        articoli.forEach(articolo => {
            if (!articoliByCategoria[articolo.categoria]) {
                articoliByCategoria[articolo.categoria] = [];
            }
            articoliByCategoria[articolo.categoria].push(articolo);
        });

        const settoreInfo = SETTORI[settore];
        let html = '';
        
        html = `
            <div class="settore-section" data-settore="${settore}">
                <h4>${settoreInfo.nome}</h4>
        `;

        for (const [categoria, items] of Object.entries(articoliByCategoria)) {
            html += `
                <div class="materiali-table">
                    <h5>${categoria}</h5>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Codice</th>
                                <th>Articolo</th>
                                <th>Inventario</th>
                                <th>Disponibilità</th>
                                <th>Quantità Richiesta</th>
                                <th>Nuova Richiesta</th>
                                <th>Note</th>
                                <th>Azioni</th>
                                <th>Check</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            for (const articolo of items) {
                // Get current availability
                const { data: giacenza } = await supabase.rpc('get_giacenza_effettiva', {
                    _settore: settore,
                    _articolo_cod: articolo.cod
                });

                // Get future availability at start date
                const { data: disponibilitaFutura } = await supabase.rpc('get_disponibilita_futura', {
                    _settore: settore,
                    _articolo_cod: articolo.cod,
                    _data: dataInizio
                });

                const disponibilita = disponibilitaFutura || 0;
                const quantitaRichiesta = 0; // This will be updated dynamically

                html += `
                    <tr>
                        <td>${articolo.cod}</td>
                        <td>${articolo.descrizione}</td>
                        <td>${articolo.quantita}</td>
                        <td class="${disponibilita < 0 ? 'quantita-negativa' : ''}">${disponibilita}</td>
                        <td class="quantita-richiesta">0</td>
                        <td>
                            <input type="number" 
                                class="quantity-input" 
                                min="0" 
                                value="0"
                                data-settore="${settore}"
                                data-codice="${articolo.cod}"
                                data-giacenza="${articolo.quantita}"
                                onchange="window.updateQuantitaRichiesta(this)">
                        </td>
                        <td>
                            <input type="text" 
                                class="note-input"
                                placeholder="Note..."
                                data-settore="${settore}"
                                data-codice="${articolo.cod}">
                        </td>
                        <td>
                            <button onclick="window.showImpegni('${settore}', '${articolo.cod}')" 
                                    class="button detail-button">
                                VISUALIZZA DETTAGLI
                            </button>
                            <button onclick="window.noleggia('${settore}', '${articolo.cod}')"
                                    class="button rent-button">
                                NOLEGGIA
                            </button>
                        </td>
                        <td>
                            <input type="checkbox" 
                                class="check-input"
                                data-settore="${settore}"
                                data-codice="${articolo.cod}">
                        </td>
                    </tr>
                `;
            }

            html += `
                        </tbody>
                    </table>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html || '<p class="no-data">Nessun articolo disponibile per questo settore</p>';

        // Add global functions
        window.updateQuantitaRichiesta = async function(input) {
            const row = input.closest('tr');
            const quantitaRichiesta = row.querySelector('.quantita-richiesta');
            const nuovaQuantita = parseInt(input.value) || 0;
            quantitaRichiesta.textContent = nuovaQuantita;
            
            // Update availability
            const settore = input.dataset.settore;
            const codice = input.dataset.codice;
            
            const { data: disponibilitaFutura } = await supabase.rpc('get_disponibilita_futura', {
                _settore: settore,
                _articolo_cod: codice,
                _data: dataInizio
            });

            const disponibilitaCell = row.querySelector('td:nth-child(4)');
            const disponibilita = (disponibilitaFutura || 0) - nuovaQuantita;
            disponibilitaCell.textContent = disponibilita;
            disponibilitaCell.className = disponibilita < 0 ? 'quantita-negativa' : '';
        };

        window.showImpegni = async function(settore, codice) {
            const { data: giacenza } = await supabase.rpc('get_giacenza_effettiva', {
                _settore: settore,
                _articolo_cod: codice
            });

            if (!giacenza || !giacenza[0]) {
                alert('Dati giacenza non disponibili');
                return;
            }

            // Create modal for showing details
            let modal = document.getElementById('impegniModal');
            if (!modal) {
                modal = createImpegniModal();
            }

            const modalContent = `
                <div class="giacenze-info">
                    <h4>Dettagli Giacenza</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Giacenza Totale:</label>
                            <span>${giacenza[0].quantita_totale}</span>
                        </div>
                        <div class="info-item">
                            <label>In Kit:</label>
                            <span>${giacenza[0].quantita_in_kit}</span>
                        </div>
                        <div class="info-item">
                            <label>Impegnata:</label>
                            <span>${giacenza[0].quantita_impegnata}</span>
                        </div>
                        <div class="info-item">
                            <label>In Uscita:</label>
                            <span>${giacenza[0].quantita_in_uscita}</span>
                        </div>
                        <div class="info-item">
                            <label>Disponibile:</label>
                            <span class="${giacenza[0].quantita_disponibile < 0 ? 'quantita-negativa' : ''}">${giacenza[0].quantita_disponibile}</span>
                        </div>
                    </div>
                </div>
            `;

            modal.querySelector('.modal-content').innerHTML = modalContent;
            modal.style.display = 'block';
        };

        window.noleggia = function(settore, codice) {
            alert('Funzionalità noleggio in sviluppo');
            // TODO: Implementare funzionalità noleggio
        };

    } catch (error) {
        console.error('Errore durante il caricamento dei materiali:', error);
        container.innerHTML = `
            <div class="error-message">
                Errore durante il caricamento: ${error.message}
            </div>
        `;
    }
}

function createImpegniModal() {
    const modalHTML = `
        <div id="impegniModal" class="modal">
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <div class="modal-body"></div>
            </div>
        </div>
        
        <style>
            .modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgba(0,0,0,0.4);
            }

            .modal-content {
                background-color: #fefefe;
                margin: 15% auto;
                padding: 20px;
                border: 1px solid #888;
                width: 80%;
                max-width: 800px;
                border-radius: 0.5rem;
                position: relative;
            }

            .modal-close {
                color: #aaa;
                float: right;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
            }

            .modal-close:hover {
                color: black;
            }

            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 1rem;
                margin-top: 1rem;
            }

            .info-item {
                background: #f8fafc;
                padding: 1rem;
                border-radius: 0.5rem;
            }

            .info-item label {
                display: block;
                font-weight: 500;
                color: #64748b;
                margin-bottom: 0.25rem;
            }

            .info-item span {
                font-size: 1.25rem;
                font-weight: 600;
                color: var(--text-color);
            }

            .quantita-negativa {
                color: #ef4444;
            }
        </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('impegniModal');

    // Setup close handlers
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };

    return modal;
}
```