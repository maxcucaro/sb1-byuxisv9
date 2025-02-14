import { kitService } from '../../js/services/kitService.js';
import { SETTORI } from '../../js/utils/constants.js';
import { articoliService } from '../../js/services/articoliService.js';
import { createKitModal } from './kitModalSimple.js';

async function displayKitDetails(kit, isComponente = false) {
    const kitDetails = document.getElementById('kitDetails');
    if (!kitDetails) return;

    try {
        let html = '';

        if (isComponente) {
            html = `
                <div class="kit-header">
                    <h4>Utilizzo nei Kit</h4>
                    <p>Questo articolo è utilizzato nei seguenti kit:</p>
                </div>
                <div class="kit-body">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Settore</th>
                                <th>Nome Kit</th>
                                <th>Quantità</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${kit.kits.map(k => `
                                <tr>
                                    <td>${SETTORI[k.kit_settore]?.nome || k.kit_settore}</td>
                                    <td>${k.kit_nome}</td>
                                    <td>${k.quantita}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            // Carica la descrizione dell'articolo principale
            const articoloResult = await articoliService.getArticoli(kit.settore);
            const articoloPrincipale = articoloResult.success ? 
                articoloResult.data.find(a => a.cod === kit.articolo_cod) : null;

            html = `
                <div class="kit-header">
                    <h4>${kit.nome}</h4>
                    <p class="kit-description">${kit.descrizione || ''}</p>
                </div>
                <div class="kit-body">
                    <div class="kit-section">
                        <h5>Articolo Principale</h5>
                        <table class="data-table">
                            <tr>
                                <th>Settore</th>
                                <td>${SETTORI[kit.settore]?.nome || kit.settore}</td>
                            </tr>
                            <tr>
                                <th>Codice</th>
                                <td>${kit.articolo_cod}</td>
                            </tr>
                            <tr>
                                <th>Descrizione</th>
                                <td>${articoloPrincipale?.descrizione || '-'}</td>
                            </tr>
                        </table>
                    </div>
                    <div class="kit-section">
                        <h5>Componenti</h5>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Settore</th>
                                    <th>Codice</th>
                                    <th>Descrizione</th>
                                    <th>Quantità</th>
                                    <th>Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${await Promise.all(kit.kit_componenti?.map(async comp => {
                                    const compResult = await articoliService.getArticoli(comp.componente_settore);
                                    const articolo = compResult.success ? 
                                        compResult.data.find(a => a.cod === comp.componente_cod) : null;
                                    
                                    return `
                                        <tr>
                                            <td>${SETTORI[comp.componente_settore]?.nome || comp.componente_settore}</td>
                                            <td>${comp.componente_cod}</td>
                                            <td>${articolo?.descrizione || '-'}</td>
                                            <td>${comp.quantita}</td>
                                            <td>${comp.note || '-'}</td>
                                        </tr>
                                    `;
                                }) || ['<tr><td colspan="5">Nessun componente</td></tr>']).join('')}
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
        }

        kitDetails.innerHTML = html;
    } catch (error) {
        console.error('Errore durante la visualizzazione dei dettagli del kit:', error);
        kitDetails.innerHTML = `
            <div class="error-message">
                Errore durante il caricamento dei dettagli: ${error.message}
            </div>
        `;
    }
}

// Esporta solo la funzione displayKitDetails
export { displayKitDetails };