import { SETTORI } from '../utils/constants.js';
import { supabase } from '../utils/supabaseClient.js';

export function createImpegniModal() {
    // Remove existing modal if present
    const existingModal = document.getElementById('impegniModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modalHTML = `
        <div id="impegniModal" class="modal">
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <h3>Dettagli Giacenze</h3>
                <div class="impegni-content"></div>
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

            .giacenze-info {
                padding: 1.5rem;
            }

            .info-header {
                margin-bottom: 1.5rem;
            }

            .info-header h4 {
                margin: 0;
                color: var(--text-color);
                font-size: 1.25rem;
            }

            .articolo-code {
                color: #6B7280;
                font-size: 0.875rem;
                margin-top: 0.25rem;
            }

            .info-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .info-item {
                background: #f8fafc;
                padding: 1rem;
                border-radius: 0.375rem;
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

            .kit-details {
                margin-top: 1.5rem;
            }

            .kit-details h4 {
                margin-bottom: 1rem;
                color: var(--text-color);
            }

            .loading-indicator {
                text-align: center;
                padding: 2rem;
            }

            .spinner {
                width: 40px;
                height: 40px;
                margin: 0 auto 1rem;
                border: 3px solid #f3f3f3;
                border-top: 3px solid var(--accent-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
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

export function showImpegniModal(content) {
    const modal = document.getElementById('impegniModal') || createImpegniModal();
    const contentContainer = modal.querySelector('.impegni-content');
    
    if (contentContainer) {
        contentContainer.innerHTML = content;
    }
    
    modal.style.display = 'block';
}

export async function showGiacenzaEffettiva(settore, codice) {
    try {
        // Show loading state
        showImpegniModal(`
            <div class="loading-indicator">
                <div class="spinner"></div>
                <p>Caricamento dettagli giacenza...</p>
            </div>
        `);

        // First get article details
        const { data: articolo, error: articoloError } = await supabase
            .from(`articoli_${settore.toLowerCase()}`)
            .select('cod, descrizione')
            .eq('cod', codice)
            .single();

        if (articoloError) throw new Error(`Errore recupero articolo: ${articoloError.message}`);

        // Get giacenza data
        const { data: giacenza, error: giacenzaError } = await supabase.rpc('get_giacenza_effettiva', {
            _settore: settore,
            _articolo_cod: codice
        });

        if (giacenzaError) throw giacenzaError;
        if (!giacenza) throw new Error('Nessun dato disponibile');

        // Create modal content
        const modalContent = `
            <div class="giacenze-info">
                <div class="info-header">
                    <h4>${articolo.descrizione}</h4>
                    <p class="articolo-code">${articolo.cod}</p>
                </div>
                
                <div class="info-row">
                    <div class="info-item">
                        <label>Giacenza Totale:</label>
                        <span>${giacenza.quantita_totale}</span>
                    </div>
                    <div class="info-item">
                        <label>In Kit:</label>
                        <span>${giacenza.quantita_in_kit}</span>
                    </div>
                    <div class="info-item">
                        <label>Impegnata:</label>
                        <span>${giacenza.quantita_impegnata}</span>
                    </div>
                    <div class="info-item">
                        <label>In Uscita:</label>
                        <span>${giacenza.quantita_in_uscita}</span>
                    </div>
                    <div class="info-item">
                        <label>Disponibile:</label>
                        <span class="${giacenza.quantita_disponibile < 0 ? 'quantita-negativa' : ''}">${giacenza.quantita_disponibile}</span>
                    </div>
                </div>

                ${giacenza.dettaglio_kit?.length > 0 ? `
                    <div class="kit-details">
                        <h4>Dettaglio Kit</h4>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Nome Kit</th>
                                    <th>Settore</th>
                                    <th>Quantità Kit</th>
                                    <th>Quantità per Kit</th>
                                    <th>Totale Impegnato</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${giacenza.dettaglio_kit.map(kit => `
                                    <tr>
                                        <td>${kit.kit_nome}</td>
                                        <td>${SETTORI[kit.kit_settore]?.nome || kit.kit_settore}</td>
                                        <td>${kit.quantita_kit}</td>
                                        <td>${kit.quantita_componente}</td>
                                        <td>${kit.totale_impegnato}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<p class="no-data">Nessun utilizzo in kit</p>'}
            </div>
        `;

        // Show modal with details
        showImpegniModal(modalContent);

    } catch (error) {
        console.error('Errore durante il recupero dei dettagli:', error);
        
        // Show error in modal
        showImpegniModal(`
            <div class="error-message">
                <h4>Errore</h4>
                <p>${error.message || 'Si è verificato un errore durante il recupero dei dettagli'}</p>
            </div>
        `);
    }
}