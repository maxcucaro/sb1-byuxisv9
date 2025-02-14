import { WORK_ORDER_TYPES } from '../../constants/workOrderTypes.js';
import { getReferenceValue } from '../../utils/referenceUtils.js';

export function createImpegniModal() {
    // Remove existing modal if present
    const existingModal = document.getElementById('impegniModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modalHTML = `
        <div id="impegniModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Dettagli Impegni</h3>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Codice Scheda</th>
                                <th>Nome</th>
                                <th>Tipo</th>
                                <th>Riferimento</th>
                                <th>Data Inizio</th>
                                <th>Data Fine</th>
                                <th>Quantità</th>
                                <th>Stato</th>
                            </tr>
                        </thead>
                        <tbody id="impegniTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Setup close handlers
    const modal = document.getElementById('impegniModal');
    const closeBtn = modal.querySelector('.close-modal');
    
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
}

export function showImpegniModal(impegni) {
    const modal = document.getElementById('impegniModal');
    const tableBody = document.getElementById('impegniTableBody');
    
    if (!modal || !tableBody) return;

    if (!impegni?.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">
                    Nessun impegno trovato
                </td>
            </tr>`;
    } else {
        tableBody.innerHTML = impegni.map(impegno => {
            const scheda = impegno.schede_lavoro;
            const refValue = getReferenceValue(scheda, scheda.tipo_lavoro, WORK_ORDER_TYPES);
            
            return `
                <tr>
                    <td>${scheda.codice}</td>
                    <td>${scheda.nome}</td>
                    <td>${scheda.tipo_lavoro}</td>
                    <td>${refValue || '-'}</td>
                    <td>${new Date(scheda.data_inizio).toLocaleDateString()}</td>
                    <td>${new Date(scheda.data_fine).toLocaleDateString()}</td>
                    <td>${impegno.quantita}</td>
                    <td class="status-${scheda.stato.toLowerCase()}">
                        ${scheda.stato}
                    </td>
                </tr>
            `;
        }).join('');
    }

    modal.style.display = 'block';
}