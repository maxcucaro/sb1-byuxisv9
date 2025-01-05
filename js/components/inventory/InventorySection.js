export function createInventorySection(settore, articoli) {
  if (!articoli?.length) {
    return `
      <div class="inventory-section">
        <h3>${settore.nome}</h3>
        <div class="no-data">Nessun articolo trovato per ${settore.nome.toLowerCase()}</div>
      </div>`;
  }

  return `
    <div class="inventory-section">
      <h3>${settore.nome}</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Codice</th>
            <th>Descrizione</th>
            <th>Categoria</th>
            <th>Quantità</th>
            <th>Ubicazione</th>
          </tr>
        </thead>
        <tbody>
          ${articoli.map(articolo => `
            <tr>
              <td>${articolo.cod || '-'}</td>
              <td>${articolo.descrizione || '-'}</td>
              <td>${articolo.categoria || '-'}</td>
              <td>${articolo.quantita || 0}</td>
              <td>${articolo.ubicazione || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}