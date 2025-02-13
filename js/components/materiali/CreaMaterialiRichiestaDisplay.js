import { SETTORI } from '../../utils/constants.js';
import { inventoryCache } from './InventoryCache.js';
import { supabase } from '../../utils/supabaseClient.js';

export async function displayCreaMaterialiRichiesta(container, dataInizio) {
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
                                <th>Quantità</th>
                                <th>Note</th>
                                <th>Azioni</th>
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
                    _articolo_cod: articolo.cod,
                    _settore: settore,
                    _data: dataInizio
                });

                const disponibile = disponibilitaFutura || 0;

                html += `
                    <tr>
                        <td>${articolo.cod}</td>
                        <td>${articolo.descrizione}</td>
                        <td>${articolo.quantita}</td>
                        <td class="${disponibile < 0 ? 'quantita-negativa' : ''}">${disponibile}</td>
                        <td>
                            <input type="number" 
                                class="quantity-input" 
                                min="0" 
                                value="0"
                                data-settore="${settore}"
                                data-codice="${articolo.cod}"
                                data-giacenza="${articolo.quantita}">
                        </td>
                        <td>
                            <input type="text" 
                                class="note-input"
                                placeholder="Note..."
                                data-settore="${settore}"
                                data-codice="${articolo.cod}">
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button onclick="window.showImpegni('${settore}', '${articolo.cod}', '${articolo.descrizione}')" 
                                        class="button detail-button">
                                    DETTAGLI
                                </button>
                            </div>
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

        setupEventHandlers(settore, dataInizio);

    } catch (error) {
        console.error('Errore durante il caricamento dei materiali:', error);
        container.innerHTML = `
            <div class="error-message">
                Errore durante il caricamento: ${error.message}
            </div>
        `;
    }
}

function setupEventHandlers(settore, dataInizio) {
    // Add global functions
    window.showImpegni = async function(settore, codice, descrizione) {
        try {
            const { data: giacenza } = await supabase.rpc('get_giacenza_effettiva', {
                _settore: settore,
                _articolo_cod: codice
            });

            if (!giacenza || !giacenza[0]) {
                throw new Error('Dati giacenza non disponibili');
            }

            // Get future commitments
            const { data: impegni } = await supabase.rpc('get_impegni_futuri', {
                _settore: settore,
                _articolo_cod: codice,
                _data_inizio: dataInizio
            });

            // Create modal for showing details
            let modal = document.getElementById('impegniModal');
            if (!modal) {
                modal = createImpegniModal();
            }

            const modalContent = `
                <div class="modal-header">
                    <h3>${descrizione}</h3>
                    <span class="modal-close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="giacenze-info">
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

                    <div class="impegni-section">
                        <h4>Impegni Futuri</h4>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Codice</th>
                                    <th>Nome</th>
                                    <th>Data Inizio</th>
                                    <th>Data Fine</th>
                                    <th>Quantità</th>
                                    <th>Stato</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${impegni && impegni.length > 0 ? impegni.map(impegno => `
                                    <tr>
                                        <td>${impegno.codice}</td>
                                        <td>${impegno.nome}</td>
                                        <td>${new Date(impegno.data_inizio).toLocaleDateString()}</td>
                                        <td>${new Date(impegno.data_fine).toLocaleDateString()}</td>
                                        <td>${impegno.quantita}</td>
                                        <td class="status-${impegno.stato.toLowerCase()}">${impegno.stato}</td>
                                    </tr>
                                `).join('') : `
                                    <tr>
                                        <td colspan="6" class="no-data">Nessun impegno futuro trovato</td>
                                    </tr>
                                `}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            modal.innerHTML = modalContent;

            // Setup close handler
            const closeBtn = modal.querySelector('.modal-close');
            closeBtn.onclick = () => modal.style.display = 'none';

            modal.style.display = 'block';

        } catch (error) {
            console.error('Errore durante il recupero dei dettagli:', error);
            alert('Errore durante il recupero dei dettagli: ' + error.message);
        }
    };
}

function createImpegniModal() {
    const modalHTML = `
        <div id="impegniModal" class="modal">
            <div class="modal-content">
                <!-- Content will be dynamically inserted -->
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
                margin: 5% auto;
                padding: 0;
                border: 1px solid #888;
                width: 90%;
                max-width: 1000px;
                border-radius: 0.5rem;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .modal-header {
                background: var(--primary-color);
                color: white;
                padding: 1.25rem;
                border-radius: 0.5rem 0.5rem 0 0;
                position: relative;
            }

            .modal-header h3 {
                margin: 0;
                font-size: 1.25rem;
            }

            .modal-close {
                position: absolute;
                right: 1.25rem;
                top: 1.25rem;
                color: white;
                font-size: 1.5rem;
                font-weight: bold;
                cursor: pointer;
            }

            .modal-close:hover {
                opacity: 0.8;
            }

            .modal-body {
                padding: 1.5rem;
            }

            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
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

            .impegni-section h4 {
                color: var(--text-color);
                margin: 0 0 1rem 0;
                padding-bottom: 0.5rem;
                border-bottom: 2px solid var(--accent-color);
            }

            .quantita-negativa {
                color: #ef4444;
            }

            .action-buttons {
                display: flex;
                gap: 0.5rem;
            }

            .detail-button {
                width: 120px;
                height: 40px;
                line-height: 40px;
                padding: 0;
                text-align: center;
            }

            .status-bozza { color: #f59e0b; }
            .status-approvata { color: #10b981; }
            .status-in_corso { color: #3b82f6; }
            .status-completata { color: #059669; }
            .status-annullata { color: #ef4444; }
        </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('impegniModal');

    // Setup close handlers
    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };

    return modal;
}