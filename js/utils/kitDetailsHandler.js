import { supabase } from './supabaseClient.js';
import { SETTORI } from './constants.js';
import { kitService } from '../services/kitService.js';

export async function showKitDetails(settore, codice, isKit = false) {
    try {
        // Create or get modal
        let modal = document.getElementById('kitModal');
        if (!modal) {
            modal = createKitModal();
        }

        // Show loading state
        const kitDetails = modal.querySelector('.kit-details');
        kitDetails.innerHTML = '<div class="loading">Caricamento dettagli...</div>';
        modal.style.display = 'block';

        if (isKit) {
            // Get kit details
            const result = await kitService.getKitByArticolo(settore, codice);
            if (!result.success) throw new Error(result.error);

            const kit = result.data;
            if (!kit) throw new Error('Kit non trovato');

            // Get giacenza for main article
            const { data: giacenza } = await supabase.rpc('get_giacenza_effettiva', {
                _settore: settore,
                _articolo_cod: codice
            });

            kitDetails.innerHTML = `
                <div class="kit-info">
                    <h4>${kit.nome}</h4>
                    <p class="kit-description">${kit.descrizione || ''}</p>
                    
                    <div class="giacenze-info">
                        <div class="info-item">
                            <label>Giacenza Totale:</label>
                            <span>${giacenza[0].quantita_totale}</span>
                        </div>
                        <div class="info-item">
                            <label>Quantità Kit:</label>
                            <span>${kit.quantita_kit}</span>
                        </div>
                        <div class="info-item">
                            <label>Disponibile:</label>
                            <span class="${giacenza[0].quantita_disponibile < 0 ? 'quantita-negativa' : ''}">${giacenza[0].quantita_disponibile}</span>
                        </div>
                    </div>

                    <div class="kit-components">
                        <h4>Componenti</h4>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Settore</th>
                                    <th>Codice</th>
                                    <th>Descrizione</th>
                                    <th>Quantità per Kit</th>
                                    <th>Totale Richiesto</th>
                                    <th>Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${kit.kit_componenti.map(comp => {
                                    const totaleRichiesto = comp.quantita * kit.quantita_kit;
                                    return `
                                        <tr>
                                            <td>${SETTORI[comp.componente_settore]?.nome || comp.componente_settore}</td>
                                            <td>${comp.componente_cod}</td>
                                            <td>${comp.componente_descrizione || 'Non trovato'}</td>
                                            <td>${comp.quantita}</td>
                                            <td>${totaleRichiesto}</td>
                                            <td>${comp.note || '-'}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else {
            // Get kit usage details
            const { data: giacenza } = await supabase.rpc('get_giacenza_effettiva', {
                _settore: settore,
                _articolo_cod: codice
            });

            // Get article details
            const { data: articolo } = await supabase
                .from(`articoli_${settore.toLowerCase()}`)
                .select('descrizione')
                .eq('cod', codice)
                .single();

            kitDetails.innerHTML = `
                <div class="kit-info">
                    <h4>${articolo?.descrizione || codice}</h4>
                    
                    <div class="giacenze-info">
                        <div class="info-item">
                            <label>Giacenza Totale:</label>
                            <span>${giacenza[0].quantita_totale}</span>
                        </div>
                        <div class="info-item">
                            <label>In Kit:</label>
                            <span>${giacenza[0].quantita_in_kit}</span>
                        </div>
                        <div class="info-item">
                            <label>Disponibile:</label>
                            <span class="${giacenza[0].quantita_disponibile < 0 ? 'quantita-negativa' : ''}">${giacenza[0].quantita_disponibile}</span>
                        </div>
                    </div>

                    ${giacenza[0].dettaglio_kit?.length > 0 ? `
                        <div class="kit-usage">
                            <h4>Utilizzo nei Kit</h4>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Nome Kit</th>
                                        <th>Settore</th>
                                        <th>Quantità per Kit</th>
                                        <th>Numero Kit</th>
                                        <th>Totale Impegnato</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${giacenza[0].dettaglio_kit.map(kit => `
                                        <tr>
                                            <td>${kit.kit_nome}</td>
                                            <td>${SETTORI[kit.kit_settore]?.nome || kit.kit_settore}</td>
                                            <td>${kit.quantita_componente}</td>
                                            <td>${kit.quantita_kit}</td>
                                            <td>${kit.totale_impegnato}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : '<p class="no-data">Questo articolo non è utilizzato in nessun kit</p>'}
                </div>
            `;
        }

    } catch (error) {
        console.error('Errore durante la visualizzazione dei dettagli:', error);
        const kitDetails = document.querySelector('.kit-details');
        if (kitDetails) {
            kitDetails.innerHTML = `
                <div class="error-message">
                    <h4>Errore</h4>
                    <p>${error.message || 'Si è verificato un errore durante il recupero dei dettagli'}</p>
                </div>
            `;
        }
    }
}

function createKitModal() {
    const modalHTML = `
        <div id="kitModal" class="modal">
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <h3>Dettagli Kit</h3>
                <div class="kit-details"></div>
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
                position: absolute;
                right: 20px;
                top: 10px;
            }

            .modal-close:hover,
            .modal-close:focus {
                color: black;
                text-decoration: none;
                cursor: pointer;
            }

            .kit-details {
                margin-top: 1rem;
            }

            .kit-info {
                margin-bottom: 1.5rem;
            }

            .kit-info h4 {
                margin-bottom: 1rem;
                color: var(--text-color);
            }

            .kit-description {
                color: #666;
                margin-bottom: 1rem;
            }

            .giacenze-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-bottom: 1.5rem;
                background: #f8fafc;
                padding: 1rem;
                border-radius: 0.5rem;
            }

            .info-item {
                padding: 0.5rem;
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

            .loading {
                text-align: center;
                padding: 2rem;
                color: #666;
            }

            .error-message {
                color: #ef4444;
                padding: 1rem;
                background: #fee2e2;
                border-radius: 0.375rem;
                margin-top: 1rem;
            }

            .error-message h4 {
                margin-bottom: 0.5rem;
                color: #991b1b;
            }

            .no-data {
                text-align: center;
                padding: 2rem;
                color: #6B7280;
                font-style: italic;
            }
        </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('kitModal');

    // Setup close handlers
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };

    return modal;
}