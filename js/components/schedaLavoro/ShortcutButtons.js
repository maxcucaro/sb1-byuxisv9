export function createShortcutButtons(tipo) {
    const shortcuts = {
        'INTERNO': `
            <button type="button" class="button" onclick="window.open('../../pages/pages_anagrafiche/aggiungi_produzione_scheda.html', 'nuovaProduzione', 'width=800,height=600')">
                Aggiungi Produzione
            </button>
        `,
        'NOLEGGIO': `
            <button type="button" class="button" onclick="window.open('../../pages/pages_anagrafiche/aggiungi_cliente.html', 'nuovoCliente', 'width=800,height=600')">
                Aggiungi Cliente
            </button>
        `,
        'CONTOVISIONE': `
            <button type="button" class="button" onclick="window.open('../../pages/pages_anagrafiche/aggiungi_cliente.html', 'nuovoCliente', 'width=800,height=600')">
                Aggiungi Cliente
            </button>
        `,
        'RESO_FORNITORE': `
            <button type="button" class="button" onclick="window.open('../../pages/pages_anagrafiche/aggiungi_fornitore.html', 'nuovoFornitore', 'width=800,height=600')">
                Aggiungi Fornitore
            </button>
        `,
        'ASSISTENZA': `
            <button type="button" class="button" onclick="window.open('../../pages/pages_anagrafiche/aggiungi_cat.html', 'nuovoCat', 'width=800,height=600')">
                Aggiungi CAT
            </button>
        `
    };

    return shortcuts[tipo] || '';
}