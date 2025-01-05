import { WORK_ORDER_TYPES } from '../../constants/workOrderTypes.js';
import { getReferenceValue } from '../../utils/referenceUtils.js';

export function createWorkOrdersTable(schede, tipo) {
    // Filtra le schede per mostrare solo quelle non in bozza
    const schedeNonBozza = schede?.filter(scheda => scheda.stato !== 'BOZZA') || [];

    if (!schedeNonBozza.length) {
        return `<tr><td colspan="9" class="no-data">Nessuna scheda lavoro trovata</td></tr>`;
    }

    return schedeNonBozza.map(scheda => {
        const refValue = getReferenceValue(scheda, tipo, WORK_ORDER_TYPES);
        
        // Determina il pulsante workspace in base allo stato
        let workspaceButton = '';
        switch (scheda.stato) {
            case 'APPROVATA':
                workspaceButton = `<a href="pages/workspace/schede/workspace-materiali.html?id=${scheda.id}" class="button workspace-button">Crea Richiesta</a>`;
                break;
            case 'IN_CORSO':
                workspaceButton = `<a href="pages/workspace/schede/workspace-materiali.html?id=${scheda.id}" class="button workspace-button">In Preparazione</a>`;
                break;
            case 'COMPLETATA':
                workspaceButton = `<a href="pages/workspace/schede/workspace-materiali.html?id=${scheda.id}" class="button workspace-button">In Uscita</a>`;
                break;
        }
        
        return `<tr>
            <td>${scheda.codice}</td>
            <td>${scheda.nome}</td>
            <td>${refValue || '-'}</td>
            <td>${new Date(scheda.data_inizio).toLocaleDateString()}</td>
            <td>${new Date(scheda.data_fine).toLocaleDateString()}</td>
            <td>${scheda.luogo}</td>
            <td>${scheda.responsabile || '-'}</td>
            <td class="status-${scheda.stato.toLowerCase()}">${scheda.stato}</td>
            <td>
                <button onclick="visualizzaScheda('${scheda.id}')" class="button">Visualizza</button>
                <button onclick="modificaScheda('${scheda.id}')" class="button">Modifica</button>
                ${workspaceButton}
            </td>
        </tr>`;
    }).join('');
}