import { supabase } from '../utils/supabaseClient.js';
import { SETTORI } from '../utils/constants.js';

class InventoryService {
    constructor() {
        this.cache = new Map();
        this.cacheExpiration = 5 * 60 * 1000; // 5 minutes
        this.pendingRequests = new Map();
    }

    async getInventoryByDate(date = null) {
        try {
            console.log('Inizio recupero inventario...');
            const settoriKeys = Object.keys(SETTORI);
            let results = {};

            // Load all sectors in parallel
            const promises = settoriKeys.map(async (settore) => {
                try {
                    // Check cache first
                    const cacheKey = `${settore}_${date || 'current'}`;
                    const cached = this.cache.get(cacheKey);
                    if (cached && Date.now() - cached.timestamp < this.cacheExpiration) {
                        console.log(`Usando cache per ${settore}`);
                        return [settore, cached.data];
                    }

                    // Check if there's already a pending request
                    if (this.pendingRequests.has(cacheKey)) {
                        return [settore, await this.pendingRequests.get(cacheKey)];
                    }

                    // Create new request promise
                    const requestPromise = (async () => {
                        const { data, error } = await supabase
                            .from(`articoli_${settore.toLowerCase()}`)
                            .select('*')
                            .eq('attivo', true)
                            .order('categoria', { ascending: true })
                            .order('descrizione', { ascending: true });

                        if (error) throw error;

                        // Cache the result
                        this.cache.set(cacheKey, {
                            data: data || [],
                            timestamp: Date.now()
                        });

                        return data || [];
                    })();

                    // Store pending request
                    this.pendingRequests.set(cacheKey, requestPromise);

                    try {
                        const data = await requestPromise;
                        return [settore, data];
                    } finally {
                        // Clean up pending request
                        this.pendingRequests.delete(cacheKey);
                    }

                } catch (error) {
                    console.error(`Errore query settore ${settore}:`, error);
                    return [settore, []];
                }
            });

            // Wait for all requests to complete
            const results_array = await Promise.all(promises);
            results = Object.fromEntries(results_array);

            // Group articles by category for each sector
            const groupedResults = {};
            for (const [settore, articoli] of Object.entries(results)) {
                if (Array.isArray(articoli) && articoli.length > 0) {
                    const articoliByCategoria = {};
                    articoli.forEach(articolo => {
                        if (!articoliByCategoria[articolo.categoria]) {
                            articoliByCategoria[articolo.categoria] = [];
                        }
                        articoliByCategoria[articolo.categoria].push(articolo);
                    });
                    groupedResults[settore] = articoliByCategoria;
                }
            }

            return { success: true, data: groupedResults };
        } catch (error) {
            console.error('Errore durante il recupero inventario:', error);
            return { success: false, error: error.message };
        }
    }

    clearCache() {
        this.cache.clear();
    }

    async testConnection() {
        try {
            console.log('Test connessione Supabase...');
            const { data, error } = await supabase
                .from('settori_categorie')
                .select('count')
                .limit(1);

            if (error) {
                console.error('Errore connessione:', error);
                return false;
            }
            console.log('Connessione riuscita!');
            return true;
        } catch (error) {
            console.error('Errore test connessione:', error);
            return false;
        }
    }
}

export const inventoryService = new InventoryService();