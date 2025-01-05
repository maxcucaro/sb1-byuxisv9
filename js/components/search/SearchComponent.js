import { filterSchede } from './SearchFilter.js';
import { ordinaSchedePerStato } from '../../utils/schedeUtils.js';
import { createSchedeTable } from '../schede/SchedeTable.js';

export function createSearchComponent() {
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
                <option value="tipo_lavoro">Tipo</option>
                <option value="luogo">Luogo</option>
                <option value="stato">Stato</option>
            </select>
        </div>`;
}

export function initializeSearch(tableBody, schede) {
    const searchInput = document.getElementById('searchInput');
    const searchFilter = document.getElementById('searchFilter');
    
    function updateTable() {
        const searchText = searchInput.value.toLowerCase();
        const filterField = searchFilter.value;
        const filteredSchede = filterSchede(schede, searchText, filterField);
        const ordinatedSchede = ordinaSchedePerStato(filteredSchede);
        tableBody.innerHTML = createSchedeTable(ordinatedSchede);
    }
    
    searchInput.addEventListener('input', updateTable);
    searchFilter.addEventListener('change', updateTable);
}