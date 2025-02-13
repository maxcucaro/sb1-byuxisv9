import { anagraficheService } from '../../services/anagraficheService.js';

export async function loadFornitori(select) {
    if (!select) return;

    try {
        const result = await anagraficheService.getFornitori();
        if (!result.success) throw new Error(result.error);

        select.innerHTML = '<option value="">Seleziona fornitore</option>';
        result.data.forEach(fornitore => {
            if (fornitore.attivo) {
                const option = document.createElement('option');
                option.value = fornitore.id;
                option.textContent = fornitore.ragione_sociale;
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Errore durante il caricamento dei fornitori:', error);
        throw error;
    }
}