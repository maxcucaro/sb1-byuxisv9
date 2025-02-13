import { supabase } from './supabaseClient.js';
import { SETTORI } from './constants.js';
import { utils, writeFile } from 'https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs';

export async function downloadInventario() {
    try {
        // Show loading indicator
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const progressContainer = document.getElementById('progressBarContainer');
        
        progressContainer.style.display = 'block';
        progressBar.style.width = '30%';
        progressText.textContent = 'Caricamento dati...';

        // Get inventory data
        const { data: inventario, error } = await supabase
            .from('inventario_completo')
            .select('*')
            .order('settore')
            .order('categoria')
            .order('descrizione');

        if (error) throw error;

        progressBar.style.width = '60%';
        progressText.textContent = 'Preparazione file...';

        // Transform data for Excel
        const excelData = inventario.map(item => ({
            Settore: SETTORI[item.settore]?.nome || item.settore,
            Codice: item.cod,
            Descrizione: item.descrizione,
            Categoria: item.categoria,
            Quantità: item.quantita,
            'In Kit': item.quantita_in_kit || 0,
            Disponibile: item.quantita_disponibile || 0,
            Ubicazione: item.ubicazione || '',
            Stato: item.attivo ? 'Attivo' : 'Inattivo'
        }));

        // Create workbook
        const wb = utils.book_new();
        const ws = utils.json_to_sheet(excelData);

        // Add column widths
        ws['!cols'] = [
            { wch: 15 }, // Settore
            { wch: 12 }, // Codice
            { wch: 40 }, // Descrizione
            { wch: 20 }, // Categoria
            { wch: 10 }, // Quantità
            { wch: 10 }, // In Kit
            { wch: 12 }, // Disponibile
            { wch: 15 }, // Ubicazione
            { wch: 10 }  // Stato
        ];

        // Add worksheet to workbook
        utils.book_append_sheet(wb, ws, 'Inventario');

        progressBar.style.width = '90%';
        progressText.textContent = 'Download in corso...';

        // Generate filename with current date
        const date = new Date().toISOString().split('T')[0];
        const filename = `inventario_${date}.xlsx`;

        // Download file
        writeFile(wb, filename);

        // Complete progress
        progressBar.style.width = '100%';
        progressText.textContent = 'Completato';

        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 1000);

    } catch (error) {
        console.error('Errore durante il download:', error);
        alert('Errore durante il download dell\'inventario: ' + error.message);
        
        // Hide progress on error
        const progressContainer = document.getElementById('progressBarContainer');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
    }
}