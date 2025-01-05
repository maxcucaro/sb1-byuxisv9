// Utility per l'ordinamento delle schede
export const STATI_ORDINE = {
    'BOZZA': 1,
    'APPROVATA': 2, 
    'IN_CORSO': 3,
    'COMPLETATA': 4,
    'ANNULLATA': 5
};

export function ordinaSchedePerStato(schede) {
    return [...schede].sort((a, b) => {
        // Ordina prima per stato
        const statoOrder = (STATI_ORDINE[a.stato] || 99) - (STATI_ORDINE[b.stato] || 99);
        if (statoOrder !== 0) return statoOrder;
        
        // Se stesso stato, ordina per data inizio decrescente
        return new Date(b.data_inizio) - new Date(a.data_inizio);
    });
}