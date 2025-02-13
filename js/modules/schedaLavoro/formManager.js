import { loadTipiLavoro } from './tipiLavoro.js';
import { loadClienti } from './clienti.js';
import { loadCAT } from './cat.js';
import { loadFornitori } from './fornitori.js';
import { loadProduzioni } from './produzioni.js';
import { loadTeamMembers } from './team.js';
import { showFormField, hideFormField } from '../../utils/formUtils.js';
import { supabaseInstance } from '../../utils/supabaseClient.js';

export const WORK_TYPES = {
    'INTERNO': { 
        ref: 'produzione',
        refLabel: 'Produzione'
    },
    'NOLEGGIO': { 
        ref: 'cliente',
        refLabel: 'Cliente'
    },
    'CONTOVISIONE': { 
        ref: 'cliente',
        refLabel: 'Cliente'
    },
    'RESO_FORNITORE': { 
        ref: 'fornitore',
        refLabel: 'Fornitore'
    },
    'ASSISTENZA': { 
        ref: 'cat',
        refLabel: 'CAT'
    }
};

export class FormManager {
    constructor(form) {
        if (!form) throw new Error('Form element is required');
        this.form = form;
        this.setupEventHandlers();
    }

    async init() {
        try {
            // Ensure Supabase is connected first
            const connected = await supabaseInstance.init();
            if (!connected) {
                throw new Error('Impossibile connettersi al database');
            }

            // Load all required data in parallel
            await Promise.all([
                this.loadTipiLavoro(),
                this.loadReferenceData()
            ]);

            this.hideAllOptionalFields();
            return true;
        } catch (error) {
            console.error('Errore durante l\'inizializzazione del form:', error);
            throw error;
        }
    }

    async loadTipiLavoro() {
        const tipoSelect = this.form.tipo_lavoro;
        if (!tipoSelect) {
            throw new Error('Campo tipo lavoro non trovato');
        }
        return loadTipiLavoro(tipoSelect);
    }

    async loadReferenceData() {
        try {
            await Promise.all([
                loadProduzioni(this.form.produzione_id),
                loadClienti(this.form.cliente_id),
                loadCAT(this.form.cat_id),
                loadFornitori(this.form.fornitore_id),
                loadTeamMembers(this.form.responsabile_id)
            ]);
        } catch (error) {
            throw new Error(`Errore caricamento dati di riferimento: ${error.message}`);
        }
    }

    setupEventHandlers() {
        const tipoSelect = this.form.tipo_lavoro;
        if (tipoSelect) {
            tipoSelect.addEventListener('change', () => this.handleTipoLavoroChange(tipoSelect.value));
        }
    }

    handleTipoLavoroChange(tipo) {
        this.hideAllOptionalFields();
        
        const workType = WORK_TYPES[tipo];
        if (workType) {
            switch (workType.ref) {
                case 'produzione':
                    showFormField('produzione_id', this.form);
                    break;
                case 'cliente':
                    showFormField('cliente_id', this.form);
                    break;
                case 'cat':
                    showFormField('cat_id', this.form);
                    break;
                case 'fornitore':
                    showFormField('fornitore_id', this.form);
                    break;
            }
        }
    }

    hideAllOptionalFields() {
        ['produzione_id', 'cliente_id', 'cat_id', 'fornitore_id'].forEach(fieldId => {
            hideFormField(fieldId, this.form);
        });
    }
}