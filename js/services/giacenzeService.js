import { supabase } from '../utils/supabaseClient.js';

export class GiacenzeService {
    async getGiacenzeArticolo(settore, articoloCod, dataInizio) {
        try {
            if (!settore || !articoloCod || !dataInizio) {
                throw new Error('Parametri mancanti per il calcolo delle giacenze');
            }

            // Get current inventory
            const { data: giacenzaAttuale, error: errorAttuale } = await supabase
                .rpc('get_giacenza_attuale', {
                    _settore: settore,
                    _articolo_cod: articoloCod
                });

            if (errorAttuale) throw errorAttuale;

            // Get predicted inventory at start date
            const { data: giacenzaPrevista, error: errorPrevista } = await supabase
                .rpc('get_giacenza_data', {
                    _settore: settore,
                    _articolo_cod: articoloCod,
                    _data: dataInizio
                });

            if (errorPrevista) throw errorPrevista;

            // Get future commitments with complete scheda details
            const { data: impegniFuturi, error: errorImpegni } = await supabase
                .from('materiali_richiesti')
                .select(`
                    quantita,
                    schede_lavoro (
                        codice,
                        nome,
                        tipo_lavoro,
                        data_inizio,
                        data_fine,
                        stato,
                        produzione:produzioni(nome),
                        cliente:clienti(ragione_sociale),
                        cat:cat(nome, cognome),
                        fornitore:fornitori(ragione_sociale)
                    )
                `)
                .eq('settore', settore)
                .eq('articolo_cod', articoloCod)
                .gte('schede_lavoro.data_inizio', dataInizio)
                .neq('schede_lavoro.stato', 'BOZZA')
                .neq('schede_lavoro.stato', 'ANNULLATA');

            if (errorImpegni) throw errorImpegni;

            // Format the response with additional details
            const impegni = impegniFuturi?.map(imp => {
                const scheda = imp.schede_lavoro;
                let riferimento = '-';
                
                // Determine reference based on tipo_lavoro
                switch (scheda.tipo_lavoro) {
                    case 'INTERNO':
                        riferimento = scheda.produzione?.nome;
                        break;
                    case 'NOLEGGIO':
                    case 'CONTOVISIONE':
                        riferimento = scheda.cliente?.ragione_sociale;
                        break;
                    case 'ASSISTENZA':
                        riferimento = scheda.cat ? `${scheda.cat.nome} ${scheda.cat.cognome}` : null;
                        break;
                    case 'RESO_FORNITORE':
                        riferimento = scheda.fornitore?.ragione_sociale;
                        break;
                }

                return {
                    codice_scheda: scheda.codice,
                    nome_scheda: scheda.nome,
                    tipo_lavoro: scheda.tipo_lavoro,
                    riferimento: riferimento || '-',
                    data_inizio: scheda.data_inizio,
                    data_fine: scheda.data_fine,
                    quantita: imp.quantita,
                    stato: scheda.stato
                };
            }) || [];

            return {
                success: true,
                data: {
                    giacenza_attuale: giacenzaAttuale || 0,
                    giacenza_prevista: giacenzaPrevista || 0,
                    impegni_futuri: impegni
                }
            };
        } catch (error) {
            console.error('Errore durante il recupero giacenze:', error);
            return { 
                success: false, 
                error: error.message || 'Errore durante il recupero delle giacenze',
                data: {
                    giacenza_attuale: 0,
                    giacenza_prevista: 0,
                    impegni_futuri: []
                }
            };
        }
    }
}

export const giacenzeService = new GiacenzeService();