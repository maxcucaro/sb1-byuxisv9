export function filterSchede(schede, searchText, filterField) {
    if (!searchText) return schede;
    
    searchText = searchText.toLowerCase();
    
    return schede.filter(scheda => {
        if (filterField === 'all') {
            return Object.values(scheda).some(value => 
                String(value).toLowerCase().includes(searchText)
            );
        }
        
        const value = scheda[filterField];
        return value && String(value).toLowerCase().includes(searchText);
    });
}

export function setupSearch(container, schede, updateUI) {
    const searchInput = container.querySelector('#searchInput');
    const searchFilter = container.querySelector('#searchFilter');
    
    function performSearch() {
        const searchText = searchInput.value;
        const filterField = searchFilter.value;
        const filteredSchede = filterSchede(schede, searchText, filterField);
        updateUI(filteredSchede);
    }
    
    searchInput.addEventListener('input', performSearch);
    searchFilter.addEventListener('change', performSearch);
}