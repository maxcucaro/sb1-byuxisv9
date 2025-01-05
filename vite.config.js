import { defineConfig } from 'vite';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      port: 3000
    },
    root: '.',
    publicDir: 'public',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        input: {
          main: '/index.html',
          impostazioni: '/impostazioni.html',
          giacenze: '/giacenze.html',
          'schede-lavori': '/schede-lavori.html'
        }
      }
    },
    define: {
      'window.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'window.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
    }
  };
});