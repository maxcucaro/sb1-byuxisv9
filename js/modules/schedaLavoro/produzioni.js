import { anagraficheService } from '../../services/anagraficheService.js';

export async function loadProduzioni(select) {
    if (!select) return;
    
    const produzioni = await anagraficheService.getProduzioni();
    if (produzioni.success) {
        select.innerHTML = '<option value="">Seleziona produzione</option>';
        produzioni.data.forEach(prod => {
            if (prod.attivo) {
                const option = document.createElement('option');
                option.value = prod.id;
                option.textContent = prod.nome;
                select.appendChild(option);
            }
        });
    }
}