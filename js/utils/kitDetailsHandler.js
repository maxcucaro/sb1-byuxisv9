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

            if (!giacenza || !giacenza[0]) throw new Error('Dati giacenza non disponibili');

            const giacenzaAttuale = giacenza[0].quantita_totale || 0;
            const quantitaInKit = giacenza[0].quantita_in_kit || 0;

            kitDetails.innerHTML = `
                <div class="kit-header">
                    <h4>${kit.nome}</h4>
                    <div class="giacenze-info">
                        <p><strong>Giacenza Attuale:</strong> ${giacenzaAttuale}</p>
                        <p><strong>Quantità Impegnata in Kit:</strong> ${quantitaInKit}</p>
                        <p><strong>Quantità Disponibile:</strong> ${giacenzaAttuale - quantitaInKit}</p>
                    </div>
                    <p class="kit-description">${kit.descrizione || ''}</p>
                </div>
                <div class="kit-body">
                    <div class="kit-section">
                        <h5>Componenti</h5>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Settore</th>
                                    <th>Codice</th>
                                    <th>Descrizione</th>
                                    <th>Quantità per Kit</th>
                                    <th>Totale Impegnato</th>
                                    <th>Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${kit.kit_componenti.map(comp => {
                                    const totaleImpegnato = comp.quantita * (kit.quantita_kit || 1);
                                    return `
                                        <tr>
                                            <td>${SETTORI[comp.componente_settore]?.nome || comp.componente_settore}</td>
                                            <td>${comp.componente_cod}</td>
                                            <td>${comp.componente_descrizione || 'Non trovato'}</td>
                                            <td>${comp.quantita}</td>
                                            <td>${totaleImpegnato}</td>
                                            <td>${comp.note || '-'}</td>
                                        </tr>
                                    `;
                                }).join('') || `
                                    <tr>
                                        <td colspan="6" class="no-data">Nessun componente trovato</td>
                                    </tr>
                                `}
                            </tbody>
                        </table>
                    </div>
                    ${kit.note ? `
                        <div class="kit-section">
                            <h5>Note</h5>
                            <p>${kit.note}</p>
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            // Get kit usage details
            const { data: giacenza } = await supabase.rpc('get_giacenza_effettiva', {
                _settore: settore,
                _articolo_cod: codice
            });

            if (!giacenza || !giacenza[0]) throw new Error('Dati giacenza non disponibili');

            const kits = Array.isArray(giacenza[0].dettaglio_kit) ? giacenza[0].dettaglio_kit : [];
            
            kitDetails.innerHTML = `
                <div class="kit-info">
                    <h4>Utilizzo nei Kit</h4>
                    <div class="giacenze-info">
                        <p><strong>Giacenza Attuale:</strong> ${giacenza[0].quantita_totale || 0}</p>
                        <p><strong>Quantità Impegnata in Kit:</strong> ${giacenza[0].quantita_in_kit || 0}</p>
                        <p><strong>Quantità Disponibile:</strong> ${giacenza[0].quantita_disponibile || 0}</p>
                    </div>
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
                            ${kits.length > 0 ? kits.map(kit => `
                                <tr>
                                    <td>${kit.kit_nome}</td>
                                    <td>${SETTORI[kit.kit_settore]?.nome || kit.kit_settore}</td>
                                    <td>${kit.quantita_componente}</td>
                                    <td>${kit.quantita_kit}</td>
                                    <td>${kit.totale_impegnato}</td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td colspan="5" class="no-data">Questo articolo non è utilizzato in nessun kit</td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            `;
        }

    } catch (error) {
        console.error('Errore durante la visualizzazione del kit:', error);
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
                margin: 5% auto;
                padding: 0;
                border: 1px solid #888;
                width: 90%;
                max-width: 1000px;
                border-radius: 0.5rem;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .modal-content h3 {
                margin: 0;
                padding: 1.25rem;
                background: var(--primary-color);
                color: white;
                border-radius: 0.5rem 0.5rem 0 0;
                font-size: 1.25rem;
                position: relative;
            }

            .modal-close {
                color: white;
                float: right;
                font-size: 1.5rem;
                font-weight: bold;
                cursor: pointer;
                position: absolute;
                right: 1.25rem;
                top: 1.25rem;
            }

            .modal-close:hover {
                opacity: 0.8;
            }

            .kit-details {
                padding: 1.5rem;
            }

            .kit-header {
                margin-bottom: 1.5rem;
            }

            .kit-header h4 {
                margin: 0;
                font-size: 1.5rem;
                color: var(--text-color);
            }

            .kit-description {
                color: #4B5563;
                margin: 0.5rem 0;
                line-height: 1.5;
            }

            .giacenze-info {
                background: #f8fafc;
                padding: 1rem;
                border-radius: 0.5rem;
                margin: 1rem 0;
            }

            .giacenze-info p {
                margin: 0.5rem 0;
            }

            .kit-section {
                margin-bottom: 2rem;
            }

            .kit-section:last-child {
                margin-bottom: 0;
            }

            .kit-section h5 {
                color: var(--text-color);
                font-size: 1.1rem;
                margin: 0 0 1rem 0;
                padding-bottom: 0.5rem;
                border-bottom: 2px solid var(--accent-color);
            }

            .loading {
                text-align: center;
                padding: 2rem;
                color: #6B7280;
            }

            .error-message {
                color: #ef4444;
                padding: 1rem;
                background: #fee2e2;
                border-radius: 0.5rem;
            }

            .error-message h4 {
                margin: 0 0 0.5rem 0;
                color: #991b1b;
            }

            .error-message p {
                margin: 0;
            }

            .no-data {
                text-align: center;
                padding: 2rem;
                color: #6B7280;
                font-style: italic;
                background: #f8fafc;
                border-radius: 0.5rem;
            }

            @media (max-width: 768px) {
                .modal-content {
                    margin: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: 0;
                }
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