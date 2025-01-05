import { formatDate } from '../../utils/dateUtils.js';
import { getReferenceValue } from '../../utils/referenceUtils.js';
import { WORK_ORDER_TYPES } from '../../constants/workOrderTypes.js';

export function createWorkOrdersSection(tipo, schede) {
    if (!schede?.length) {
        return `
            <div class="no-data">
                Nessuna scheda lavoro trovata
            </div>
        `;
    }

    const tipoInfo = WORK_ORDER_TYPES[tipo];
    if (!tipoInfo) return '';

    return `
        <div class="work-orders-section">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Codice</th>
                        <th>Nome</th>
                        <th>${tipoInfo.refLabel}</th>
                        <th>Data Inizio</th>
                        <th>Data Fine</th>
                        <th>Luogo</th>
                        <th>Responsabile</th>
                        <th>Stato</th>
                        <th>Azioni</th>
                    </tr>
                </thead>
                <tbody>
                    ${schede.map(scheda => `
                        <tr>
                            <td>${scheda.codice}</td>
                            <td>${scheda.nome}</td>
                            <td>${getReferenceValue(scheda, tipo, WORK_ORDER_TYPES) || '-'}</td>
                            <td>${formatDate(scheda.data_inizio)}</td>
                            <td>${formatDate(scheda.data_fine)}</td>
                            <td>${scheda.luogo}</td>
                            <td>${scheda.responsabile || '-'}</td>
                            <td class="status-${scheda.stato.toLowerCase()}">${scheda.stato}</td>
                            <td>
                                <button onclick="visualizzaScheda('${scheda.id}')" class="button">
                                    Visualizza
                                </button>
                                <button onclick="modificaScheda('${scheda.id}')" class="button">
                                    Modifica
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}