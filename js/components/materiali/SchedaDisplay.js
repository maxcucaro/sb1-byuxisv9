import { WORK_ORDER_TYPES } from '../../constants/workOrderTypes.js';
import { getReferenceValue } from '../../utils/referenceUtils.js';

export function displaySchedaDetails(scheda) {
    // Display basic info
    document.getElementById('codiceScheda').textContent = scheda.codice;
    document.getElementById('nomeScheda').textContent = scheda.nome;
    document.getElementById('tipoLavoroScheda').textContent = scheda.tipo_lavoro;
    
    // Display reference based on tipo_lavoro
    const refValue = getReferenceValue(scheda, scheda.tipo_lavoro, WORK_ORDER_TYPES);
    document.getElementById('riferimentoScheda').textContent = refValue || '-';
    
    // Display dates
    document.getElementById('dateScheda').textContent = 
        `Dal ${new Date(scheda.data_inizio).toLocaleDateString()} al ${new Date(scheda.data_fine).toLocaleDateString()}`;
    
    // Display other details
    document.getElementById('luogoScheda').textContent = scheda.luogo;
    document.getElementById('responsabileScheda').textContent = scheda.responsabile ? 
        `${scheda.responsabile.nome} ${scheda.responsabile.cognome}` : '-';
    
    // Set status with appropriate class
    const statoElement = document.getElementById('statoScheda');
    statoElement.textContent = scheda.stato;
    statoElement.className = `status-badge status-${scheda.stato.toLowerCase()}`;
}