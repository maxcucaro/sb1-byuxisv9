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

        // First verify if article exists
        const { data: articolo, error: articoloError } = await supabase
            .from(`articoli_${settore.toLowerCase()}`)
            .select('cod, descrizione, quantita')
            .eq('cod', codice)
            .single();

        if (articoloError) {
            throw new Error(`Articolo ${codice} non trovato nel settore ${settore}`);
        }

        // Get giacenza data
        const { data: giacenza, error: giacenzaError } = await supabase.rpc('get_giacenza_effettiva', {
            _settore: settore,
            _articolo_cod: codice
        });

        if (giacenzaError) throw giacenzaError;
        if (!giacenza) throw new Error('Nessun dato disponibile');

        // Get kit details
        const { data: kitDetails, error: kitError } = await supabase
            .from('kit_componenti')
            .select(`
                kit_id,
                quantita,
                kit_articoli (
                    nome,
                    settore,
                    articolo_cod,
                    quantita_kit
                )
            `)
            .eq('componente_settore', settore)
            .eq('componente_cod', codice);

        if (kitError) throw kitError;

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

                ${kitDetails && kitDetails.length > 0 ? `
                    <div class="kit-details">
                        <h4>Utilizzo nei Kit</h4>
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
                                ${kitDetails.map(kit => {
                                    const totaleImpegnato = kit.quantita * kit.kit_articoli.quantita_kit;
                                    return `
                                        <tr>
                                            <td>${kit.kit_articoli.nome}</td>
                                            <td>${SETTORI[kit.kit_articoli.settore]?.nome || kit.kit_articoli.settore}</td>
                                            <td>${kit.kit_articoli.quantita_kit}</td>
                                            <td>${kit.quantita}</td>
                                            <td>${totaleImpegnato}</td>
                                        </tr>
                                    `;
                                }).join('')}
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