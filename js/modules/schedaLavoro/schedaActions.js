import { schedeLavoroService } from '../../services/schedeLavoroService.js';

export async function handleSaveAndExit(schedaId) {
    try {
        const result = await schedeLavoroService.getSchedaLavoroById(schedaId);
        if (!result.success) {
            throw new Error(result.error);
        }

        // Save current state if needed
        // For now we just redirect back to the list
        window.location.href = '../../schede-lavori.html';
    } catch (error) {
        console.error('Errore durante il salvataggio:', error);
        alert('Errore durante il salvataggio: ' + error.message);
    }
}