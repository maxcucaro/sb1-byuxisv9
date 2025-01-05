import { schedeLavoroService } from '../../services/schedeLavoroService.js';
import { createSchedeTable } from './SchedeTable.js';
import { ordinaSchedePerStato } from '../../utils/schedeUtils.js';
import { createSearchComponent, initializeSearch } from '../search/SearchComponent.js';

export async function loadSchedeList(tableBody, loadingIndicator) {
    if (!tableBody || !loadingIndicator) {
        console.error('Elementi DOM non trovati');
        return;
    }

    try {
        const result = await schedeLavoroService.getSchedeLavoro();
        if (!result.success) {
            throw new Error(result.error);
        }

        // Add search component before table
        const searchContainer = document.createElement('div');
        searchContainer.innerHTML = createSearchComponent();
        tableBody.parentElement.parentElement.insertBefore(
            searchContainer, 
            tableBody.parentElement
        );

        // Initialize search with all schede
        initializeSearch(tableBody, result.data);

        // Initial render with ordered schede
        const schedeOrdinate = ordinaSchedePerStato(result.data);
        tableBody.innerHTML = createSchedeTable(schedeOrdinate);

    } catch (error) {
        console.error('Errore durante il caricamento:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="error-message">
                    ${error.message || 'Errore durante il caricamento delle schede lavoro'}
                </td>
            </tr>`;
    } finally {
        loadingIndicator.style.display = 'none';
    }
}