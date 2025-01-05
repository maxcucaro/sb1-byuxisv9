import { anagraficheService } from '../../services/anagraficheService.js';

export async function loadClienti(select) {
    if (!select) return;
    
    try {
        const result = await anagraficheService.getClienti();
        if (!result.success) throw new Error(result.error);

        select.innerHTML = '<option value="">Seleziona cliente</option>';
        result.data.forEach(cliente => {
            if (cliente.attivo) {
                const option = document.createElement('option');
                option.value = cliente.id;
                option.textContent = cliente.ragione_sociale;
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Errore durante il caricamento dei clienti:', error);
        throw error;
    }
}