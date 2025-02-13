export function createInventorySection(settore, articoli) {
    if (!articoli?.length) {
        return `
            <div class="inventory-section">
                <h3>${settore.nome}</h3>
                <div class="no-data">Nessun articolo trovato per ${settore.nome.toLowerCase()}</div>
            </div>`;
    }

    // Group articles by category
    const articoliByCategoria = {};
    articoli.forEach(articolo => {
        if (!articoliByCategoria[articolo.categoria]) {
            articoliByCategoria[articolo.categoria] = [];
        }
        articoliByCategoria[articolo.categoria].push(articolo);
    });

    let html = `
        <div class="inventory-section">
            <h3>${settore.nome}</h3>
    `;

    // Create tables for each category
    Object.entries(articoliByCategoria).forEach(([categoria, items]) => {
        html += `
            <div class="category-section">
                <h4>${categoria}</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Codice</th>
                            <th>Descrizione</th>
                            <th>Quantità</th>
                            <th>Ubicazione</th>
                            <th>Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(articolo => `
                            <tr>
                                <td>${articolo.cod || '-'}</td>
                                <td>${articolo.descrizione || '-'}</td>
                                <td>${articolo.quantita || 0}</td>
                                <td>${articolo.ubicazione || '-'}</td>
                                <td>
                                    <button onclick="window.modificaArticolo('${settore.nome}', '${articolo.cod}')" class="button">
                                        Modifica
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    });

    html += '</div>';
    return html;
}