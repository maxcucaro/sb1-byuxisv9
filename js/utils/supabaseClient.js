import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const supabaseUrl = 'https://idewdhvmcyhpgvpmkefd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkZXdkaHZtY3locGd2cG1rZWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1ODgxNDMsImV4cCI6MjA1MTE2NDE0M30.RAIBKUjHAbx_a5_KUvs-Loc2hNd6SU6etOEczz4-moQ';

class SupabaseClient {
    constructor() {
        this.client = createClient(supabaseUrl, supabaseAnonKey, {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        });
        this.isConnected = false;
        this.maxRetries = 5;
        this.retryDelay = 1000;
        this.connectionPromise = null;
        this.lastError = null;
        this.connectionAttempts = 0;
        this.offlineMode = false;
    }

    async init() {
        if (this.isConnected) return true;
        if (this.connectionPromise) return this.connectionPromise;

        this.connectionPromise = this._initConnection();
        return this.connectionPromise;
    }

    async _initConnection() {
        this.connectionAttempts = 0;
        
        while (this.connectionAttempts < this.maxRetries) {
            try {
                console.log(`Tentativo di connessione a Supabase ${this.connectionAttempts + 1}/${this.maxRetries}...`);
                
                this._showConnectionStatus();
                
                const { data, error } = await this.client
                    .from('settori_categorie')
                    .select('count')
                    .limit(1)
                    .single();

                if (!error) {
                    this.isConnected = true;
                    this.lastError = null;
                    this.connectionAttempts = 0;
                    this.offlineMode = false;
                    console.log('✅ Connessione Supabase stabilita');
                    
                    this._hideConnectionStatus();
                    return true;
                }

                this.lastError = error;
                this.connectionAttempts++;
                
                if (this.connectionAttempts < this.maxRetries) {
                    const delay = this.retryDelay * Math.pow(2, this.connectionAttempts - 1);
                    console.log(`Attendo ${delay}ms prima di riprovare...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

            } catch (error) {
                this.lastError = error;
                this.connectionAttempts++;
                
                if (this.connectionAttempts === this.maxRetries) {
                    this.offlineMode = true;
                    this._hideConnectionStatus();
                    console.warn('Passaggio a modalità offline');
                    return false;
                }
                
                const delay = this.retryDelay * Math.pow(2, this.connectionAttempts - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        this._hideConnectionStatus();
        return false;
    }

    _showConnectionStatus() {
        let statusContainer = document.getElementById('supabaseStatus');
        if (!statusContainer) {
            statusContainer = document.createElement('div');
            statusContainer.id = 'supabaseStatus';
            statusContainer.style.cssText = `
                position: fixed;
                top: 1rem;
                right: 1rem;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 0.25rem;
                font-size: 0.875rem;
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            `;
            document.body.appendChild(statusContainer);
        }

        statusContainer.innerHTML = `
            <div class="spinner" style="
                width: 16px;
                height: 16px;
                border: 2px solid #fff;
                border-top-color: transparent;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            "></div>
            <span>Connessione in corso... (${this.connectionAttempts + 1}/${this.maxRetries})</span>
        `;

        if (!document.getElementById('spinnerStyle')) {
            const style = document.createElement('style');
            style.id = 'spinnerStyle';
            style.textContent = `
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    _hideConnectionStatus() {
        const statusContainer = document.getElementById('supabaseStatus');
        if (statusContainer) {
            statusContainer.remove();
        }
    }

    get supabase() {
        return this.client;
    }

    async retryOperation(operation, description = '') {
        let attempts = 0;
        
        while (attempts < this.maxRetries) {
            try {
                if (!this.isConnected && !this.offlineMode) {
                    await this.init();
                }

                if (this.offlineMode) {
                    console.warn(`Operazione "${description}" non eseguita - modalità offline`);
                    return { data: null, error: new Error('Modalità offline') };
                }

                return await operation(this.client);
            } catch (error) {
                attempts++;
                console.error(`Errore durante ${description} (tentativo ${attempts}/${this.maxRetries}):`, error);
                
                if (attempts === this.maxRetries) {
                    throw error;
                }

                const delay = this.retryDelay * Math.pow(2, attempts - 1);
                console.log(`Attendo ${delay}ms prima di riprovare...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                if (error.message === 'Failed to fetch' || !this.isConnected) {
                    this.isConnected = false;
                    await this.init();
                }
            }
        }
    }

    getLastError() {
        return this.lastError;
    }

    isOffline() {
        return this.offlineMode;
    }
}

export const supabaseInstance = new SupabaseClient();
export const supabase = supabaseInstance.supabase;

// Initialize connection immediately
supabaseInstance.init().catch(error => {
    console.error('Errore inizializzazione Supabase:', error);
});