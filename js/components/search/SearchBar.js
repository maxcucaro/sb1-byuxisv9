export function createSearchBar() {
    return `
        <div class="search-bar">
            <input 
                type="text" 
                id="searchInput" 
                placeholder="Cerca per codice, nome, luogo..."
                class="search-input"
            >
            <select id="searchFilter" class="search-filter">
                <option value="all">Tutti i campi</option>
                <option value="codice">Codice</option>
                <option value="nome">Nome</option>
                <option value="luogo">Luogo</option>
                <option value="stato">Stato</option>
            </select>
        </div>
    `;
}