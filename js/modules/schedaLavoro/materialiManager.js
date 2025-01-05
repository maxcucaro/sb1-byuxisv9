import { articoliService } from '../../services/articoliService.js';

export class MaterialiManager {
    constructor(container) {
        this.container = container;
        this.materiali = new Map();
        this.setupListeners();
    }

    setupListeners() {
        const settoreSelect = this.container.querySelector('#settore');
        const articoloSelect = this.container.querySelector('#articolo');
        const quantitaInput = this.container.querySelector('#quantita');
        const aggiungiBtn = this.container.querySelector('#aggiungiMateriale');

        settoreSelect?.addEventListener('change', () => this.onSettoreChange(settoreSelect.value));
        articoloSelect?.addEventListener('change', () => this.onArticoloChange());
        aggiungiBtn?.addEventListener('click', () => this.aggiungiMateriale());
    }

    async onSettoreChange(settore) {
        const articoloSelect = this.container.querySelector('#articolo');
        const quantitaInput = this.container.querySelector('#quantita');
        const aggiungiBtn = this.container.querySelector('#aggiungiMateriale');

        if (!settore) {
            articoloSelect.disabled = true;
            quantitaInput.disabled = true;
            aggiungiBtn.disabled = true;
            return;
        }

        try {
            const result = await articoliService.getArticoli(settore);
            if (!result.success) {
                throw new Error(result.error);
            }

            articoloSelect.innerHTML = '<option value="">Seleziona articolo</option>';
            result.data.forEach(articolo => {
                const option = document.createElement('option');
                option.value = articolo.cod;
                option.textContent = `${articolo.cod} - ${articolo.descrizione}`;
                option.dataset.articolo = JSON.stringify(articolo);
                articoloSelect.appendChild(option);
            });

            articoloSelect.disabled = false;
            quantitaInput.disabled = true;
            aggiungiBtn.disabled = true;
        } catch (error) {
            console.error('Errore durante il caricamento degli articoli:', error);
            alert('Errore durante il caricamento degli articoli: ' + error.message);
        }
    }

    onArticoloChange() {
        const articoloSelect = this.container.querySelector('#articolo');
        const quantitaInput = this.container.querySelector('#quantita');
        const aggiungiBtn = this.container.querySelector('#aggiungiMateriale');

        if (!articoloSelect.value) {
            quantitaInput.disabled = true;
            aggiungiBtn.disabled = true;
            return;
        }

        quantitaInput.disabled = false;
        aggiungiBtn.disabled = false;
    }

    aggiungiMateriale() {
        const settoreSelect = this.container.querySelector('#settore');
        const articoloSelect = this.container.querySelector('#articolo');
        const quantitaInput = this.container.querySelector('#quantita');
        
        const selectedOption = articoloSelect.selectedOptions[0];
        if (!selectedOption) return;

        const articolo = JSON.parse(selectedOption.dataset.articolo);
        const quantita = parseInt(quantitaInput.value);

        if (quantita < 1) {
            alert('La quantità deve essere maggiore di 0');
            return;
        }

        const key = articolo.cod;
        this.materiali.set(key, {
            settore: settoreSelect.value,
            ...articolo,
            quantita
        });

        this.updateTable();
        
        // Reset form
        articoloSelect.value = '';
        quantitaInput.value = '1';
        quantitaInput.disabled = true;
        aggiungiBtn.disabled = true;
    }

    updateTable() {
        const tbody = this.container.querySelector('#materialiTable');
        if (!tbody) return;

        if (this.materiali.size === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="no-data">Nessun materiale selezionato</td>
                </tr>`;
            return;
        }

        tbody.innerHTML = Array.from(this.materiali.values())
            .map(materiale => `
                <tr>
                    <td>${materiale.settore}</td>
                    <td>${materiale.cod}</td>
                    <td>${materiale.descrizione}</td>
                    <td>${materiale.quantita}</td>
                    <td>
                        <button type="button" class="button" 
                                onclick="window.rimuoviMateriale('${materiale.cod}')">
                            Rimuovi
                        </button>
                    </td>
                </tr>
            `).join('');
    }

    rimuoviMateriale(codice) {
        this.materiali.delete(codice);
        this.updateTable();
    }

    getMateriali() {
        return Array.from(this.materiali.values());
    }
}