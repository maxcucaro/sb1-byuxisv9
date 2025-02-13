export class MaterialiManager {
    constructor() {
        this.materiali = new Map();
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }

    async addMateriale(settore, codice, quantita, note = '') {
        const key = `${settore}-${codice}`;
        
        try {
            // Validate inputs
            if (!settore || !codice || !quantita || quantita < 1) {
                throw new Error('Dati materiale non validi');
            }

            this.materiali.set(key, {
                settore,
                cod: codice,
                quantita: parseInt(quantita),
                note: note || null
            });

            return true;
        } catch (error) {
            console.error('Errore durante aggiunta materiale:', error);
            return false;
        }
    }

    updateQuantita(settore, codice, quantita) {
        const key = `${settore}-${codice}`;
        if (this.materiali.has(key)) {
            const materiale = this.materiali.get(key);
            materiale.quantita = parseInt(quantita) || 0;
        }
    }

    updateNote(settore, codice, note) {
        const key = `${settore}-${codice}`;
        if (this.materiali.has(key)) {
            const materiale = this.materiali.get(key);
            materiale.note = note || null;
        }
    }

    getMateriali() {
        return Array.from(this.materiali.values())
            .filter(m => m.quantita > 0)
            .map(m => ({
                settore: m.settore,
                cod: m.cod,
                quantita: m.quantita,
                note: m.note
            }));
    }

    hasMateriale(settore, codice) {
        return this.materiali.has(`${settore}-${codice}`);
    }

    getMateriale(settore, codice) {
        return this.materiali.get(`${settore}-${codice}`);
    }

    clear() {
        this.materiali.clear();
    }
}