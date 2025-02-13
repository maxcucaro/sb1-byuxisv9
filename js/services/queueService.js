import { supabase } from '../utils/supabaseClient.js';

class QueueService {
    constructor() {
        this.QUEUE_KEY = 'form_queue';
        this.DRAFT_KEY = 'form_draft';
        this.processingQueue = false;
    }

    // Salva una bozza nel localStorage
    async saveDraft(formData) {
        try {
            localStorage.setItem(this.DRAFT_KEY, JSON.stringify({
                data: formData,
                timestamp: new Date().toISOString()
            }));
            return true;
        } catch (error) {
            console.error('Errore salvataggio bozza:', error);
            return false;
        }
    }

    // Recupera una bozza dal localStorage
    getDraft() {
        try {
            const draft = localStorage.getItem(this.DRAFT_KEY);
            return draft ? JSON.parse(draft) : null;
        } catch (error) {
            console.error('Errore recupero bozza:', error);
            return null;
        }
    }

    // Rimuove la bozza dal localStorage
    clearDraft() {
        localStorage.removeItem(this.DRAFT_KEY);
    }

    // Aggiunge un'operazione alla coda
    async addToQueue(operation, data) {
        try {
            const queue = this.getQueue();
            queue.push({
                id: crypto.randomUUID(),
                operation,
                data,
                status: 'PENDING',
                timestamp: new Date().toISOString(),
                retryCount: 0
            });
            this.saveQueue(queue);
            
            // Avvia il processamento della coda
            if (!this.processingQueue) {
                this.processQueue();
            }
            return true;
        } catch (error) {
            console.error('Errore aggiunta alla coda:', error);
            return false;
        }
    }

    // Recupera la coda dal localStorage
    getQueue() {
        try {
            const queue = localStorage.getItem(this.QUEUE_KEY);
            return queue ? JSON.parse(queue) : [];
        } catch (error) {
            console.error('Errore recupero coda:', error);
            return [];
        }
    }

    // Salva la coda nel localStorage
    saveQueue(queue) {
        localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    }

    // Processa la coda
    async processQueue() {
        if (this.processingQueue) return;
        this.processingQueue = true;

        try {
            let queue = this.getQueue();
            
            while (queue.length > 0) {
                const item = queue[0];
                
                if (item.retryCount >= 3) {
                    // Sposta in fondo alla coda dopo 3 tentativi
                    queue.push({
                        ...queue.shift(),
                        retryCount: 0,
                        status: 'RETRY'
                    });
                    continue;
                }

                try {
                    await this.processItem(item);
                    queue.shift(); // Rimuovi l'item completato
                } catch (error) {
                    console.error(`Errore processamento item ${item.id}:`, error);
                    queue[0].retryCount++;
                    queue[0].lastError = error.message;
                    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, item.retryCount)));
                }

                this.saveQueue(queue);
                queue = this.getQueue(); // Ricarica la coda per eventuali nuovi item
            }
        } finally {
            this.processingQueue = false;
        }
    }

    // Processa un singolo item della coda
    async processItem(item) {
        switch (item.operation) {
            case 'CREATE_SCHEDA':
                await this.processCreateScheda(item.data);
                break;
            case 'UPDATE_SCHEDA':
                await this.processUpdateScheda(item.data);
                break;
            default:
                throw new Error(`Operazione non supportata: ${item.operation}`);
        }
    }

    // Processa la creazione di una scheda
    async processCreateScheda(data) {
        const { formData, materiali } = data;

        // Step 1: Crea la scheda
        const { data: scheda, error: schedaError } = await supabase
            .from('schede_lavoro')
            .insert([formData])
            .select()
            .single();

        if (schedaError) throw schedaError;

        // Step 2: Se ci sono materiali, aggiungili
        if (materiali?.length > 0) {
            const { error: materialiError } = await supabase
                .from('materiali_richiesti')
                .insert(
                    materiali.map(m => ({
                        scheda_id: scheda.id,
                        ...m
                    }))
                );

            if (materialiError) throw materialiError;
        }

        return scheda;
    }

    // Processa l'aggiornamento di una scheda
    async processUpdateScheda(data) {
        const { id, formData, materiali } = data;

        // Step 1: Aggiorna la scheda
        const { error: schedaError } = await supabase
            .from('schede_lavoro')
            .update(formData)
            .eq('id', id);

        if (schedaError) throw schedaError;

        // Step 2: Aggiorna i materiali
        if (materiali) {
            // Prima rimuovi i materiali esistenti
            const { error: deleteError } = await supabase
                .from('materiali_richiesti')
                .delete()
                .eq('scheda_id', id);

            if (deleteError) throw deleteError;

            // Poi inserisci i nuovi materiali
            if (materiali.length > 0) {
                const { error: materialiError } = await supabase
                    .from('materiali_richiesti')
                    .insert(
                        materiali.map(m => ({
                            scheda_id: id,
                            ...m
                        }))
                    );

                if (materialiError) throw materialiError;
            }
        }
    }
}

export const queueService = new QueueService();