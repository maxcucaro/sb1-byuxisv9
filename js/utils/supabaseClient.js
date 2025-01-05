import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// Get environment variables
const supabaseUrl = 'https://idewdhvmcyhpgvpmkefd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkZXdkaHZtY3locGd2cG1rZWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1ODgxNDMsImV4cCI6MjA1MTE2NDE0M30.RAIBKUjHAbx_a5_KUvs-Loc2hNd6SU6etOEczz4-moQ';

// Initialize Supabase client with retry logic
const fetchWithRetry = async (...args) => {
  const maxRetries = 3;
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(...args);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed:`, error);
      lastError = error;
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw lastError;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Don't persist auth state
  },
  global: {
    fetch: fetchWithRetry
  }
});

// Test connection function
export async function testConnection() {
  try {
    const { error } = await supabase.from('tipologie_lavoro').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error('Errore di connessione a Supabase:', error);
    return false;
  }
}