import { loadProduzioni } from './produzioni.js';
import { loadTeamMembers } from './team.js';
import { handleFormSubmit } from './formSubmit.js';

export async function initSchedaLavoroForm() {
    try {
        const produzioniSelect = document.getElementById('produzione_id');
        
        // Load produzioni
        await loadProduzioni(produzioniSelect);
        
        // Load team members
        await loadTeamMembers();
        
        // Handle form submission
        const form = document.getElementById('schedaLavoroForm');
        if (form) {
            form.onsubmit = handleFormSubmit;
        }
        
        return true;
    } catch (error) {
        console.error('Errore durante l\'inizializzazione:', error);
        return false;
    }
}