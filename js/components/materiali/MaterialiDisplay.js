import { articoliService } from '../../services/articoliService.js';
import { giacenzeService } from '../../services/giacenzeService.js';
import { materialiRichiestiService } from '../../services/materialiRichiestiService.js';
import { SETTORI } from '../../utils/constants.js';
import { createImpegniModal, showImpegniModal } from './ImpegniModal.js';

export async function displayMateriali(container, schedaId, dataInizio, isEditing = false) {
    try {
        createImpegniModal();

        let materialiRichiesti = [];
        if (schedaId) {
            const result = await materialiRichiestiService.getMaterialiRichiesti(schedaId);
            if (result.success) {
                materialiRichiesti = result.data;
            }
        }

        let html = '';
        
        for (const [settoreKey, settoreInfo] of Object.entries(SETTORI)) {
            const result = await articoliService.getArticoli(settoreKey);
            if (!result.success) continue;

            const articoliByCategoria = {};
            for (const articolo of result.data) {
                if (!articoliByCategoria[articolo.categoria]) {
                    articoliByCategoria[articolo.categoria] = [];
                }
                articoliByCategoria[articolo.categoria].push(articolo);
            }

            if (Object.keys(articoliByCategoria).length > 0) {
                html += `
                    <div class="settore-section">
                        <h4>${settoreInfo.nome}</h4>
                `;

                for (const [categoria, articoli] of Object.entries(articoliByCategoria)) {
                    html += `
                        <div class="materiali-table">
                            <h5>${categoria}</h5>
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Codice</th>
                                        <th>Descrizione</th>
                                        <th>Giacenza Attuale</th>
                                        <th>Giacenza Prevista</th>
                                        <th>Dettagli</th>
                                        <th>Quantità</th>
                                        <th>Note</th>
                                        <th>Richiesta</th>
                                        <th>Azioni</th>
                                    </tr>
                                </thead>
                                <tbody>
                    `;

                    for (const articolo of articoli) {
                        try {
                            const giacenzaResult = await giacenzeService.getGiacenzeArticolo(
                                settoreKey,
                                articolo.cod,
                                dataInizio
                            );

                            const giacenzaAttuale = giacenzaResult.success ? giacenzaResult.data.giacenza_attuale : 0;
                            const giacenzaPrevista = giacenzaResult.success ? giacenzaResult.data.giacenza_prevista : 0;
                            const hasImpegni = giacenzaResult.success && giacenzaResult.data.impegni_futuri?.length > 0;

                            const materialeEsistente = materialiRichiesti.find(m => 
                                m.settore === settoreKey && m.articolo_cod === articolo.cod
                            );

                            html += `
                                <tr>
                                    <td>${articolo.cod || '-'}</td>
                                    <td>${articolo.descrizione || '-'}</td>
                                    <td>${giacenzaAttuale}</td>
                                    <td class="${giacenzaPrevista < 0 ? 'giacenza-negativa' : ''}">${giacenzaPrevista}</td>
                                    <td>
                                        ${hasImpegni ? `
                                            <button class="detail-button" onclick="window.showImpegni('${settoreKey}', '${articolo.cod}', '${dataInizio}')">
                                                Visualizza Dettagli
                                            </button>
                                        ` : ''}
                                    </td>
                                    <td>
                                        <input type="number" 
                                            class="quantity-input" 
                                            min="1" 
                                            value="${materialeEsistente ? materialeEsistente.quantita : ''}"
                                            data-settore="${settoreKey}"
                                            data-codice="${articolo.cod}"
                                            ${materialeEsistente ? 'data-existing="true"' : ''}
                                        >
                                    </td>
                                    <td>
                                        <input type="text" 
                                            class="note-input"
                                            data-settore="${settoreKey}"
                                            data-codice="${articolo.cod}"
                                            placeholder="Note..."
                                            value="${materialeEsistente?.note || ''}"
                                        >
                                    </td>
                                    <td>
                                        <input type="number" 
                                            class="request-input" 
                                            min="1" 
                                            placeholder="Nuova richiesta..."
                                            data-settore="${settoreKey}"
                                            data-codice="${articolo.cod}"
                                        >
                                    </td>
                                    <td>
                                        <button class="button" 
                                            data-settore="${settoreKey}" 
                                            data-codice="${articolo.cod}"
                                            onclick="window.handleMaterialeClick(this)">
                                            ${materialeEsistente ? 'Aggiorna' : 'Aggiungi'}
                                        </button>
                                    </td>
                                </tr>
                            `;
                        } catch (error) {
                            console.error(`Errore calcolo giacenze per ${articolo.cod}:`, error);
                            continue;
                        }
                    }

                    html += `
                                </tbody>
                            </table>
                        </div>
                    `;
                }

                html += '</div>';
            }
        }

        container.innerHTML = html || '<p class="no-data">Nessun articolo disponibile</p>';

        window.handleMaterialeClick = (button) => {
            const { settore, codice } = button.dataset;
            const row = button.closest('tr');
            const quantitaInput = row.querySelector('.quantity-input');
            const noteInput = row.querySelector('.note-input');
            const richiestaInput = row.querySelector('.request-input');
            
            const quantita = richiestaInput.value ? parseInt(richiestaInput.value) : parseInt(quantitaInput.value);
            
            if (quantita && quantita > 0) {
                if (window.materialiManager) {
                    window.materialiManager.addMateriale(
                        settore,
                        codice,
                        quantita,
                        noteInput.value
                    );
                    button.textContent = 'Aggiorna';
                    quantitaInput.value = quantita;
                    richiestaInput.value = '';
                }
            } else {
                alert('Inserire una quantità valida maggiore di 0');
            }
        };

        window.showImpegni = async (settore, codice, dataInizio) => {
            try {
                const giacenzaResult = await giacenzeService.getGiacenzeArticolo(
                    settore,
                    codice,
                    dataInizio
                );
                
                if (giacenzaResult.success && giacenzaResult.data.impegni_futuri?.length > 0) {
                    showImpegniModal(giacenzaResult.data.impegni_futuri);
                } else {
                    throw new Error('Nessun impegno trovato');
                }
            } catch (error) {
                console.error('Errore recupero impegni:', error);
                alert('Errore durante il recupero degli impegni: ' + error.message);
            }
        };

    } catch (error) {
        console.error('Errore durante il caricamento dei materiali:', error);
        container.innerHTML = `
            <div class="error-message">
                Errore durante il caricamento dei materiali: ${error.message}
            </div>
        `;
    }
}