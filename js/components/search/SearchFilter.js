export function filterSchede(schede, searchText, filterField) {
    if (!searchText) return schede;
    
    return schede.filter(scheda => {
        if (filterField === 'all') {
            return Object.entries(scheda).some(([key, value]) => {
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(searchText);
                }
                return false;
            });
        }
        
        const value = scheda[filterField];
        return value && value.toString().toLowerCase().includes(searchText);
    });
}