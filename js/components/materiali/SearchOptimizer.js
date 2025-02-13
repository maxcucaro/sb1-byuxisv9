// SearchOptimizer.js
export class SearchOptimizer {
    constructor(options = {}) {
        this.debounceTime = options.debounceTime || 300;
        this.minSearchLength = options.minSearchLength || 2;
        this.debounceTimer = null;
        this.lastSearch = '';
    }

    // Debounce search to avoid too many re-renders
    debounce(func) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(func, this.debounceTime);
    }

    // Highlight matching text
    highlightText(text, searchTerm) {
        if (!searchTerm) return text;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // Filter and sort results
    filterResults(items, searchText, fields = ['descrizione', 'cod', 'categoria']) {
        if (!searchText || searchText.length < this.minSearchLength) return items;

        const searchLower = searchText.toLowerCase();
        return items
            .filter(item => {
                return fields.some(field => {
                    const value = item[field]?.toString().toLowerCase() || '';
                    return value.includes(searchLower);
                });
            })
            .sort((a, b) => {
                // Prioritize exact matches and matches at start of string
                const aScore = this.getMatchScore(a, searchLower, fields);
                const bScore = this.getMatchScore(b, searchLower, fields);
                return bScore - aScore;
            });
    }

    // Calculate match score for sorting
    getMatchScore(item, searchText, fields) {
        let score = 0;
        fields.forEach(field => {
            const value = item[field]?.toString().toLowerCase() || '';
            if (value === searchText) score += 100; // Exact match
            if (value.startsWith(searchText)) score += 50; // Starts with
            if (value.includes(searchText)) score += 25; // Contains
        });
        return score;
    }

    // Update category filter based on search results
    updateCategoryFilter(items, categoriaFilter) {
        const categories = [...new Set(items.map(item => item.categoria))];
        categoriaFilter.innerHTML = '<option value="">Tutte le categorie</option>';
        categories.sort().forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoriaFilter.appendChild(option);
        });
    }
}