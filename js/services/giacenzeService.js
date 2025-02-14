import { supabaseInstance } from '../utils/supabaseClient.js';
import { handleError } from '../utils/errorHandling.js';

class GiacenzeService {
    async getGiacenzeArticolo(settore, articoloCod, dataInizio) {
        return handleError(async () => {
            if (!settore || !articoloCod || !dataInizio) {
                return { 
                    success: true, 
                    data: {
                        giacenza_attuale: 0,
                        giacenza_prevista: 0,
                        impegni_futuri: []
                    }
                };
            }

            try {
                const [giacenzaAttuale, impegniFuturi, kitInfo] = await Promise.all([
                    this.getGiacenzaAttuale(settore, articoloCod),
                    this.getImpegniFuturi(settore, articoloCod, dataInizio),
                    this.getKitInfo(settore, articoloCod)
                ]);

                // Calcola la quantità impegnata nei kit
                let quantitaInKit = 0;
                if (kitInfo.isComponente) {
                    quantitaInKit = kitInfo.kits.reduce((sum, kit) => {
                        // Moltiplica la quantità del componente per la quantità del kit
                        return sum + (kit.quantita * kit.quantita_kit);
                    }, 0);
                }

                // Calcola la quantità totale impegnata
                const totaleImpegni = impegniFuturi.reduce((sum, imp) => sum + imp.quantita, 0);
                
                // La giacenza prevista è la giacenza attuale meno gli impegni e la quantità in kit
                const giacenzaPrevista = giacenzaAttuale - totaleImpegni - quantitaInKit;

                return { 
                    success: true, 
                    data: {
                        giacenza_attuale: giacenzaAttuale,
                        giacenza_prevista: giacenzaPrevista,
                        impegni_futuri: impegniFuturi,
                        quantita_in_kit: quantitaInKit
                    }
                };
            } catch (error) {
                console.error(`Errore calcolo giacenze per ${articoloCod}:`, error);
                return { 
                    success: true, 
                    data: {
                        giacenza_attuale: 0,
                        giacenza_prevista: 0,
                        impegni_futuri: [],
                        quantita_in_kit: 0
                    }
                };
            }
        }, `calcolo giacenze per ${settore}-${articoloCod}`);
    }

    async getGiacenzaAttuale(settore, articoloCod) {
        try {
            const { data } = await supabaseInstance.retryOperation(
                async (supabase) => {
                    return await supabase
                        .from(`articoli_${settore.toLowerCase()}`)
                        .select('quantita')
                        .eq('cod', articoloCod)
                        .maybeSingle();
                },
                `recupero giacenza ${settore}-${articoloCod}`
            );
            return data?.quantita || 0;
        } catch (error) {
            console.error(`Errore recupero giacenza per ${articoloCod}:`, error);
            return 0;
        }
    }

    async getImpegniFuturi(settore, articoloCod, dataInizio) {
        try {
            const { data } = await supabaseInstance.retryOperation(
                async (supabase) => {
                    return await supabase
                        .from('materiali_richiesti')
                        .select(`
                            quantita,
                            schede_lavoro!inner(*)
                        `)
                        .eq('settore', settore)
                        .eq('articolo_cod', articoloCod)
                        .gte('schede_lavoro.data_inizio', dataInizio)
                        .neq('schede_lavoro.stato', 'BOZZA')
                        .neq('schede_lavoro.stato', 'ANNULLATA');
                },
                `recupero impegni ${settore}-${articoloCod}`
            );
            return data || [];
        } catch (error) {
            console.error(`Errore recupero impegni per ${articoloCod}:`, error);
            return [];
        }
    }

    async getKitInfo(settore, articoloCod) {
        try {
            // Verifica se l'articolo è un kit
            const { data: kitArticolo } = await supabaseInstance.retryOperation(
                async (supabase) => {
                    return await supabase
                        .from('kit_articoli')
                        .select('quantita_kit')
                        .eq('settore', settore)
                        .eq('articolo_cod', articoloCod)
                        .maybeSingle();
                }
            );

            // Verifica se l'articolo è un componente di kit
            const { data: kitComponenti } = await supabaseInstance.retryOperation(
                async (supabase) => {
                    return await supabase
                        .from('kit_componenti')
                        .select(`
                            quantita,
                            kit_articoli!inner(
                                quantita_kit
                            )
                        `)
                        .eq('componente_settore', settore)
                        .eq('componente_cod', articoloCod);
                }
            );

            return {
                isKit: !!kitArticolo,
                isComponente: kitComponenti?.length > 0,
                quantita_kit: kitArticolo?.quantita_kit || 0,
                kits: kitComponenti || []
            };

        } catch (error) {
            console.error(`Errore recupero info kit per ${articoloCod}:`, error);
            return {
                isKit: false,
                isComponente: false,
                quantita_kit: 0,
                kits: []
            };
        }
    }
}

export const giacenzeService = new GiacenzeService();