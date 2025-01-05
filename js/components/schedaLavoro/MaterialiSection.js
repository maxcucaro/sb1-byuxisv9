import { SETTORI } from '../../utils/constants.js';

export function createMaterialiSection() {
    return `
        <div class="materiali-section">
            <h3>Materiali</h3>
            
            <div class="materiali-controls">
                <div class="form-group">
                    <label for="settore">Settore</label>
                    <select id="settore" name="settore">
                        <option value="">Seleziona settore</option>
                        ${Object.entries(SETTORI).map(([key, value]) => `
                            <option value="${key}">${value.nome}</option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label for="articolo">Articolo</label>
                    <select id="articolo" name="articolo" disabled>
                        <option value="">Seleziona articolo</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="quantita">Quantità</label>
                    <input type="number" id="quantita" name="quantita" min="1" value="1" disabled>
                </div>

                <button type="button" id="aggiungiMateriale" class="button" disabled>
                    Aggiungi
                </button>
            </div>

            <div class="materiali-list">
                <h4>Materiali Selezionati</h4>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Settore</th>
                                <th>Codice</th>
                                <th>Descrizione</th>
                                <th>Quantità</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody id="materialiTable">
                            <tr>
                                <td colspan="5" class="no-data">Nessun materiale selezionato</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}