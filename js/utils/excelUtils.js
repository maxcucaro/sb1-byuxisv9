import { utils, writeFile } from 'https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs';

export async function downloadExcel(data, filename) {
    try {
        // Crea un nuovo workbook
        const wb = utils.book_new();
        
        // Crea un worksheet dai dati
        const ws = utils.json_to_sheet(data);
        
        // Aggiungi il worksheet al workbook
        utils.book_append_sheet(wb, ws, 'Inventario');
        
        // Scarica il file
        writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
        console.error('Errore durante la creazione del file Excel:', error);
        throw error;
    }
}