export function createShortcutButtons(tipo) {
    const shortcuts = {
        'INTERNO': `
            <button type="button" class="button" onclick="window.open('https://www.controlstage.it/pages/pages_anagrafiche/visualizza_produzioni.html', 'nuovaProduzione', 'width=800,height=600')">
                Aggiungi Produzione
            </button>
        `,
        'NOLEGGIO': `
            <button type="button" class="button" onclick="window.open('https://www.controlstage.it/pages/pages_anagrafiche/visualizza_clienti.html', 'nuovoCliente', 'width=800,height=600')">
                Aggiungi Cliente
            </button>
        `,
        'CONTOVISIONE': `
            <button type="button" class="button" onclick="window.open('https://www.controlstage.it/pages/pages_anagrafiche/visualizza_clienti.html', 'nuovoCliente', 'width=800,height=600')">
                Aggiungi Cliente
            </button>
        `,
        'RESO_FORNITORE': `
            <button type="button" class="button" onclick="window.open('https://www.controlstage.it/pages/pages_anagrafiche/visualizza_fornitori.html', 'nuovoFornitore', 'width=800,height=600')">
                Aggiungi Fornitore
            </button>
        `,
        'ASSISTENZA': `
            <button type="button" class="button" onclick="window.open('https://www.controlstage.it/pages/pages_anagrafiche/visualizza_cat.html', 'nuovoCat', 'width=800,height=600')">
                Aggiungi CAT
            </button>
        `
    };

    return shortcuts[tipo] || '';
}