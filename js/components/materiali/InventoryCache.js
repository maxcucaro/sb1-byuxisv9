import { supabase } from '../../utils/supabaseClient.js';

export class InventoryCache {
    constructor() {
        this.cache = new Map();
        this.cacheExpiration = 5 * 60 * 1000; // 5 minutes
        this.pendingRequests = new Map();
    }

    async getArticoliBySector(settore) {
        const cacheKey = `sector_${settore}`;
        
        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiration) {
            console.log(`Using cache for sector ${settore}`);
            return cached.data;
        }

        // Check if there's already a pending request
        if (this.pendingRequests.has(cacheKey)) {
            return await this.pendingRequests.get(cacheKey);
        }

        // Create new request promise
        const requestPromise = (async () => {
            try {
                const { data, error } = await supabase
                    .from('inventario_completo')
                    .select('*')
                    .eq('settore', settore)
                    .eq('attivo', true)
                    .order('categoria')
                    .order('descrizione');

                if (error) throw error;

                // Cache the result
                this.cache.set(cacheKey, {
                    data: data || [],
                    timestamp: Date.now()
                });

                return data || [];
            } catch (error) {
                console.error(`Error loading sector ${settore}:`, error);
                throw error;
            }
        })();

        // Store pending request
        this.pendingRequests.set(cacheKey, requestPromise);

        try {
            return await requestPromise;
        } finally {
            // Clean up pending request
            this.pendingRequests.delete(cacheKey);
        }
    }

    clearCache() {
        this.cache.clear();
    }
}

// Export singleton instance
export const inventoryCache = new InventoryCache();