import { createProduzioneModal } from '../modal/produzioneModal.js';
import { createClienteModal } from '../modal/clienteModal.js';
import { createFornitoreModal } from '../modal/fornitoreModal.js';
import { createCatModal } from '../modal/catModal.js';

class AnagraficheHandlers {
    constructor() {
        this.initModals();
    }

    initModals() {
        // Create modals
        createProduzioneModal();
        createClienteModal();
        createFornitoreModal();
        createCatModal();
    }

    aggiungiProduzione() {
        const modal = document.getElementById('produzioneModal');
        if (modal) modal.style.display = 'block';
    }

    aggiungiCliente() {
        const modal = document.getElementById('clienteModal');
        if (modal) modal.style.display = 'block';
    }

    aggiungiFornitore() {
        const modal = document.getElementById('fornitoreModal');
        if (modal) modal.style.display = 'block';
    }

    aggiungiCAT() {
        const modal = document.getElementById('catModal');
        if (modal) modal.style.display = 'block';
    }
}

export const anagraficheHandlers = new AnagraficheHandlers();