import { getReferenceValue } from '../../utils/referenceUtils.js';
import { WORK_ORDER_TYPES } from '../../constants/workOrderTypes.js';

export function createSchedeTable(schede, workspaceButtons = true) {
    if (!schede?.length) {
        return `
            <tr>
                <td colspan="9" class="no-data">
                    Nessuna scheda lavoro trovata
                </td>
            </tr>`;
    }

    return schede.map(scheda => {
        const refValue = getReferenceValue(scheda, scheda.tipo_lavoro, WORK_ORDER_TYPES);
        
        let workspaceButton = '';
        if (workspaceButtons) {
            switch (scheda.stato) {
                case 'APPROVATA':
                    workspaceButton = `<a href="richiesta-materiali.html?id=${scheda.id}" class="button workspace-button">Crea Richiesta</a>`;
                    break;
                case 'IN_CORSO':
                    workspaceButton = `<a href="workspace-materiali.html?id=${scheda.id}" class="button workspace-button">In Preparazione</a>`;
                    break;
                case 'COMPLETATA':
                    workspaceButton = `<a href="workspace-materiali.html?id=${scheda.id}" class="button workspace-button">In Uscita</a>`;
                    break;
            }
        }

        return `
            <tr>
                <td>${scheda.codice}</td>
                <td>${scheda.nome}</td>
                <td>${scheda.tipo_lavoro}</td>
                <td>${refValue || '-'}</td>
                <td>${new Date(scheda.data_inizio).toLocaleDateString()}</td>
                <td>${new Date(scheda.data_fine).toLocaleDateString()}</td>
                <td>${scheda.luogo}</td>
                <td class="status-${scheda.stato.toLowerCase()}">${scheda.stato}</td>
                <td>
                    <button onclick="window.visualizzaScheda('${scheda.id}')" class="button">
                        Visualizza
                    </button>
                    <a href="modifica-scheda.html?id=${scheda.id}" class="button">
                        Modifica
                    </a>
                    ${workspaceButton}
                </td>
            </tr>
        `;
    }).join('');
}