// visualizza_kit_modal.js

import { SETTORI } from '../utils/constants.js';
import { articoliService } from '../services/articoliService.js';
import { giacenzeService } from '../services/giacenzeService.js';

export function createKitModal() {
    const modalHTML = `
        <div id="kitModal" class="modal">
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <h3>Dettagli Kit</h3>
                <div class="kit-info">
                    <div id="kitDetails"></div>
                </div>
            </div>
        </div>
    `;

    // Rimuovi il modal esistente se presente
    const existingModal = document.getElementById('kitModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Setup handlers
    const modal = document.getElementById('kitModal');
    const closeBtn = modal.querySelector('.modal-close');
    
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };

    return modal;
}

export async function displayKitDetails(kit, isComponente = false) {
    const kitDetails = document.getElementById('kitDetails');
    if (!kitDetails) return;

    try {
        let html = '';

        if (isComponente) {
            // Se è un componente, mostra i kit di cui fa parte
            // Recupera la giacenza attuale del componente
            const giacenzaResult = await giacenzeService.getGiacenzeArticolo(
                kit.componente_settore,
                kit.componente_cod,
                new Date().toISOString()
            );

            const giacenzaAttuale = giacenzaResult.success ? giacenzaResult.data.giacenza_attuale : 0;
            const quantitaInKit = giacenzaResult.success ? giacenzaResult.data.quantita_in_kit : 0;

            html = `
                <div class="kit-header">
                    <h4>Utilizzo nei Kit</h4>
                    <div class="giacenze-info">
                        <p><strong>Giacenza Attuale:</strong> ${giacenzaAttuale}</p>
                        <p><strong>Quantità Impegnata in Kit:</strong> ${quantitaInKit}</p>
                        <p><strong>Quantità Disponibile:</strong> ${giacenzaAttuale - quantitaInKit}</p>
                    </div>
                    <p>Questo articolo è utilizzato nei seguenti kit:</p>
                </div>
                <div class="kit-body">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Settore</th>
                                <th>Nome Kit</th>
                                <th>Quantità per Kit</th>
                                <th>Numero Kit</th>
                                <th>Totale Impegnato</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${kit.kits.map(k => {
                                const totaleImpegnato = k.quantita * k.quantita_kit;
                                return `
                                    <tr>
                                        <td>${SETTORI[k.kit_settore]?.nome || k.kit_settore}</td>
                                        <td>${k.kit_nome}</td>
                                        <td>${k.quantita}</td>
                                        <td>${k.quantita_kit}</td>
                                        <td>${totaleImpegnato}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            // Se è un kit, mostra i suoi dettagli
            // Carica la descrizione dell'articolo principale
            const articoloResult = await articoliService.getArticoli(kit.settore);
            const articoloPrincipale = articoloResult.success ? 
                articoloResult.data.find(a => a.cod === kit.articolo_cod) : null;

            // Recupera la giacenza dell'articolo principale
            const giacenzaResult = await giacenzeService.getGiacenzeArticolo(
                kit.settore,
                kit.articolo_cod,
                new Date().toISOString()
            );

            const giacenzaAttuale = giacenzaResult.success ? giacenzaResult.data.giacenza_attuale : 0;

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
                            <tr>
                                <th>Giacenza Attuale</th>
                                <td>${giacenzaAttuale}</td>
                            </tr>
                            <tr>
                                <th>Numero Kit Creati</th>
                                <td>${kit.quantita_kit || 1}</td>
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
                                    <th>Giacenza</th>
                                    <th>Quantità per Kit</th>
                                    <th>Totale Richiesto</th>
                                    <th>Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${await Promise.all(kit.kit_componenti?.map(async comp => {
                                    // Recupera la giacenza del componente
                                    const giacenzaComp = await giacenzeService.getGiacenzeArticolo(
                                        comp.componente_settore,
                                        comp.componente_cod,
                                        new Date().toISOString()
                                    );
                                    const giacenzaCompAttuale = giacenzaComp.success ? giacenzaComp.data.giacenza_attuale : 0;
                                    const totaleRichiesto = comp.quantita * (kit.quantita_kit || 1);

                                    return `
                                        <tr>
                                            <td>${SETTORI[comp.componente_settore]?.nome || comp.componente_settore}</td>
                                            <td>${comp.componente_cod}</td>
                                            <td>${comp.descrizione || '-'}</td>
                                            <td>${giacenzaCompAttuale}</td>
                                            <td>${comp.quantita}</td>
                                            <td>${totaleRichiesto}</td>
                                            <td>${comp.note || '-'}</td>
                                        </tr>
                                    `;
                                }) || ['<tr><td colspan="7">Nessun componente</td></tr>']).join('')}
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