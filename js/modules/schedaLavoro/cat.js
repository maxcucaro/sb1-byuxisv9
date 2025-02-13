import { anagraficheService } from '../../services/anagraficheService.js';

export async function loadCAT(select) {
    if (!select) return;
    
    try {
        const result = await anagraficheService.getCAT();
        if (!result.success) throw new Error(result.error);

        select.innerHTML = '<option value="">Seleziona CAT</option>';
        result.data.forEach(cat => {
            if (cat.attivo) {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = `${cat.nome} ${cat.cognome}`;
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Errore durante il caricamento dei CAT:', error);
        throw error;
    }
}