import { anagraficheService } from './anagraficheService.js';

export async function loadAllAnagrafiche() {
    try {
        const [produzioni, clienti, fornitori, cat] = await Promise.all([
            anagraficheService.getProduzioni(),
            anagraficheService.getClienti(),
            anagraficheService.getFornitori(),
            anagraficheService.getCAT()
        ]);

        return {
            success: true,
            data: {
                produzioni: produzioni.data || [],
                clienti: clienti.data || [],
                fornitori: fornitori.data || [],
                cat: cat.data || []
            }
        };
    } catch (error) {
        console.error('Errore durante il caricamento delle anagrafiche:', error);
        return { success: false, error: error.message };
    }
}