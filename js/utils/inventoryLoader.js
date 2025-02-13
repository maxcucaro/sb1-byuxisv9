import { supabase } from './supabaseClient.js';
import { SETTORI } from './constants.js';

export async function loadInventory() {
    const container = document.getElementById('inventoryContainer');
    
    try {
        // Start progress
        updateProgress(0, 'Inizializzazione...');
        container.innerHTML = '<div class="loading-indicator">Caricamento in corso...</div>';

        // Load inventory data
        updateProgress(30, 'Caricamento dati...');
        
        // Query the unified inventory view
        const { data: inventario, error } = await supabase
            .from('inventario_completo')
            .select('*')
            .order('settore')
            .order('categoria')
            .order('descrizione');

        if (error) throw error;

        // Process data
        updateProgress(60, 'Elaborazione dati...');
        
        // Group by sector and category
        const inventarioBySector = {};
        inventario.forEach(item => {
            if (!inventarioBySector[item.settore]) {
                inventarioBySector[item.settore] = {};
            }
            if (!inventarioBySector[item.settore][item.categoria]) {
                inventarioBySector[item.settore][item.categoria] = [];
            }
            inventarioBySector[item.settore][item.categoria].push(item);
        });

        let html = '';
        for (const [settore, categorie] of Object.entries(inventarioBySector)) {
            if (Object.keys(categorie).length > 0) {
                html += `
                    <div class="inventory-section" data-settore="${settore}">
                        <h3>${SETTORI[settore]?.nome || settore}</h3>
                        ${Object.entries(categorie).map(([categoria, items]) => `
                            <div class="category-section" data-categoria="${categoria}">
                                <h4>${categoria}</h4>
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>Codice</th>
                                            <th>Descrizione</th>
                                            <th>Giacenza</th>
                                            <th>In Kit</th>
                                            <th>Disponibile</th>
                                            <th>Ubicazione</th>
                                            <th>Dettagli</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${items.map(item => {
                                            const disponibile = item.quantita - (item.quantita_in_kit || 0);
                                            const inKit = item.quantita_in_kit || 0;
                                            
                                            return `
                                                <tr data-search-text="${[
                                                    item.cod,
                                                    item.descrizione,
                                                    item.categoria,
                                                    item.ubicazione
                                                ].join(' ').toLowerCase()}">
                                                    <td>${item.cod}</td>
                                                    <td>${item.descrizione}</td>
                                                    <td>${item.quantita}</td>
                                                    <td>${inKit}</td>
                                                    <td class="${disponibile < 0 ? 'quantita-negativa' : ''}">${disponibile}</td>
                                                    <td>${item.ubicazione || '-'}</td>
                                                    <td>
                                                        <button onclick="window.getGiacenzaEffettiva('${settore}', '${item.cod}')" class="button detail-button">
                                                            Dettagli
                                                        </button>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }

        // Update display
        updateProgress(90, 'Aggiornamento visualizzazione...');
        container.innerHTML = html || '<div class="no-data">Nessun articolo trovato</div>';

        // Populate settori filter
        const settoreFilter = document.getElementById('settoreFilter');
        settoreFilter.innerHTML = '<option value="all">Tutti i settori</option>';
        Object.entries(SETTORI).forEach(([key, value]) => {
            if (inventarioBySector[key]) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = value.nome;
                settoreFilter.appendChild(option);
            }
        });

        // Complete
        updateProgress(100, 'Completato');

    } catch (error) {
        console.error('Errore durante il caricamento:', error);
        container.innerHTML = `
            <div class="error-message">
                Errore durante il caricamento: ${error.message}
            </div>
        `;
        updateProgress(100); // Ensure progress bar completes even on error
    }
}

function updateProgress(percent, text = null) {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const progressContainer = document.getElementById('progressBarContainer');
    
    // Show container if hidden
    progressContainer.style.display = 'block';
    
    // Update progress
    progressBar.style.width = `${percent}%`;
    progressText.textContent = text || `${percent}%`;
    
    // Hide container when complete
    if (percent >= 100) {
        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 500);
    }
}