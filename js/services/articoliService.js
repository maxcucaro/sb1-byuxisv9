// articoliService.js
import { supabaseInstance } from '../utils/supabaseClient.js';
import { handleError } from '../utils/errorHandling.js';

class ArticoliService {
    constructor() {
        this.cache = new Map();
        this.cacheExpiration = 5 * 60 * 1000; // 5 minuti
        this.maxRetries = 3;
        this.baseDelay = 1000;
        this.pendingRequests = new Map();
    }

    async getArticoli(settore) {
        const cacheKey = `articoli_${settore}`;
        
        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < this.cacheExpiration)) {
            return { success: true, data: cached.data };
        }

        // Check if there's already a pending request for this settore
        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey);
        }

        // Create new request promise
        const requestPromise = (async () => {
            let attempt = 0;
            while (attempt < this.maxRetries) {
                try {
                    const { data, error } = await supabaseInstance.retryOperation(async (supabase) => {
                        return await supabase
                            .from(`articoli_${settore.toLowerCase()}`)
                            .select('cod, descrizione, categoria, quantita, ubicazione, attivo')
                            .order('categoria')
                            .order('descrizione');
                    }, `recupero articoli ${settore}`);

                    if (error) throw error;

                    // Cache the result
                    const result = { success: true, data: data || [] };
                    this.cache.set(cacheKey, {
                        data: result.data,
                        timestamp: Date.now()
                    });

                    return result;
                } catch (error) {
                    attempt++;
                    console.warn(`Tentativo ${attempt}/${this.maxRetries} fallito per ${settore}:`, error);

                    if (attempt === this.maxRetries) {
                        if (cached) {
                            console.warn(`Usando dati in cache per ${settore}`);
                            return { success: true, data: cached.data };
                        }
                        throw error;
                    }

                    await new Promise(resolve => 
                        setTimeout(resolve, this.baseDelay * Math.pow(2, attempt - 1))
                    );
                }
            }
        })();

        // Store the pending request
        this.pendingRequests.set(cacheKey, requestPromise);

        try {
            const result = await requestPromise;
            return result;
        } finally {
            // Clean up pending request
            this.pendingRequests.delete(cacheKey);
        }
    }

    clearCache() {
        this.cache.clear();
    }
}

export const articoliService = new ArticoliService();