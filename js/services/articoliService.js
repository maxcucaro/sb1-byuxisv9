import { supabase } from '../utils/supabaseClient.js'

class ArticoliService {
    async getArticoli(settore) {
        try {
            if (!settore) {
                throw new Error('Settore non specificato')
            }

            const { data, error } = await supabase
                .from(`articoli_${settore.toLowerCase()}`)
                .select('*')
                .order('cod', { ascending: true })

            if (error) throw error
            return { success: true, data: data || [] }
        } catch (error) {
            console.error(`Errore durante recupero articoli ${settore}:`, error)
            return { success: false, error }
        }
    }

    async updateQuantita(settore, cod, nuovaQuantita) {
        try {
            if (!settore || !cod) {
                throw new Error('Settore e codice sono richiesti')
            }

            const { data, error } = await supabase
                .from(`articoli_${settore.toLowerCase()}`)
                .update({ quantita: nuovaQuantita })
                .eq('cod', cod)
                .select()

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            console.error(`Errore durante aggiornamento quantità:`, error)
            return { success: false, error }
        }
    }

    async toggleStato(settore, cod, nuovoStato) {
        try {
            if (!settore || !cod) {
                throw new Error('Settore e codice sono richiesti')
            }

            const { data, error } = await supabase
                .from(`articoli_${settore.toLowerCase()}`)
                .update({ attivo: nuovoStato })
                .eq('cod', cod)
                .select()

            if (error) throw error
            return { success: true, data }
        } catch (error) {
            console.error(`Errore durante aggiornamento stato:`, error)
            return { success: false, error }
        }
    }

    async getAllArticoli() {
        try {
            const results = {}
            const settori = ['AUDIO', 'LUCI', 'VIDEO', 'ELETTRICO', 'BACKLINE']
            
            await Promise.all(settori.map(async (settore) => {
                const { data } = await supabase
                    .from(`articoli_${settore.toLowerCase()}`)
                    .select('*')
                    .order('cod', { ascending: true })
                results[settore] = data || []
            }))

            return results
        } catch (error) {
            console.error('Errore durante il recupero di tutti gli articoli:', error)
            throw error
        }
    }
}

// Esporta un'istanza singleton del servizio
export const articoliService = new ArticoliService()