import { tipologieLavoroService } from '../../services/tipologieLavoroService.js';

export const TIPI_LAVORO = {
    'INTERNO': { nome: 'Lavoro Interno' },
    'NOLEGGIO': { nome: 'Noleggio' },
    'CONTOVISIONE': { nome: 'Contovisione' },
    'RESO_FORNITORE': { nome: 'Reso a Fornitore' },
    'ASSISTENZA': { nome: 'Assistenza Tecnica' }
};

export async function loadTipiLavoro(select) {
    if (!select) {
        console.error('Select element not found');
        return;
    }
    
    try {
        const result = await tipologieLavoroService.getTipologieAttive();
        if (!result.success) {
            throw new Error(result.error);
        }

        // Clear and populate select
        select.innerHTML = '<option value="">Seleziona tipo</option>';
        
        // Add options for each active work type
        result.data.forEach(({ tipo }) => {
            if (TIPI_LAVORO[tipo]) {
                const option = document.createElement('option');
                option.value = tipo;
                option.textContent = TIPI_LAVORO[tipo].nome;
                select.appendChild(option);
            }
        });

        return result.data;
    } catch (error) {
        console.error('Errore durante il caricamento dei tipi lavoro:', error);
        throw error;
    }
}