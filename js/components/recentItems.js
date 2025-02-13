export function createRecentItemsSection() {
    const section = document.createElement('div');
    section.className = 'recent-items';
    section.innerHTML = `
        <h3>Articoli Aggiunti di Recente</h3>
        <div class="recent-items-list"></div>
        <button class="finish-button">Fine Aggiunte</button>
    `;
    return section;
}

export function updateRecentItemsList(section, items) {
    const list = section.querySelector('.recent-items-list');
    if (!list) return;

    if (items.length === 0) {
        list.innerHTML = '';
        return;
    }

    list.innerHTML = items.map(item => `
        <div class="recent-item">
            <div class="recent-item-details">
                <span class="recent-item-code">${item.cod}</span>
                <span class="recent-item-desc">${item.descrizione}</span>
            </div>
            <span>Quantità: ${item.quantita}</span>
        </div>
    `).join('');
}