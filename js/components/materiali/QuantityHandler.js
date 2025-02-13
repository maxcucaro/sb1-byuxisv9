export function setupQuantityHandlers(materialiManager) {
    // Funzione per aggiornare la giacenza prevista
    window.updateGiacenzaPrevista = async (input, settore, codice) => {
        const quantita = parseInt(input.value) || 0;
        const row = input.closest('tr');
        const giacenzaAttualeCell = row.cells[2];
        const giacenzaPrevistaCell = row.cells[3];
        const detailsCell = row.cells[4];
        
        const giacenzaAttuale = parseInt(giacenzaAttualeCell.textContent);
        const giacenzaPrevista = giacenzaAttuale - quantita;
        
        giacenzaPrevistaCell.textContent = giacenzaPrevista;
        giacenzaPrevistaCell.className = giacenzaPrevista < 0 ? 'giacenza-negativa' : '';
        
        // Aggiorna pulsante dettagli se necessario
        if (giacenzaPrevista < 0 && !detailsCell.querySelector('.detail-button')) {
            const detailsButton = document.createElement('button');
            detailsButton.className = 'detail-button';
            detailsButton.textContent = 'Visualizza Dettagli';
            detailsButton.onclick = () => window.visualizzaDettagli(settore, codice);
            detailsCell.appendChild(detailsButton);
        } else if (giacenzaPrevista >= 0) {
            detailsCell.innerHTML = '';
        }
    };

    // Handle quantity changes
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('quantity-input')) {
            const { settore, codice } = e.target.dataset;
            const quantita = e.target.value;
            materialiManager.updateQuantita(settore, codice, quantita);
        }
    });

    // Handle note changes
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('note-input')) {
            const { settore, codice } = e.target.dataset;
            const note = e.target.value;
            materialiManager.updateNote(settore, codice, note);
        }
    });
}