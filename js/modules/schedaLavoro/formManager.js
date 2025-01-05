import { loadTipiLavoro } from './tipiLavoro.js';
import { loadClienti } from './clienti.js';
import { loadCAT } from './cat.js';
import { loadFornitori } from './fornitori.js';
import { loadProduzioni } from './produzioni.js';
import { loadTeamMembers } from './team.js';
import { showFormField, hideFormField } from '../../utils/formUtils.js';

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
        this.setupTipoLavoroHandler();
    }

    async init() {
        try {
            // Load all required data
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
            throw new Error('Tipo lavoro select not found');
        }
        return loadTipiLavoro(tipoSelect);
    }

    async loadReferenceData() {
        return Promise.all([
            loadProduzioni(this.form.produzione_id),
            loadClienti(this.form.cliente_id),
            loadCAT(this.form.cat_id),
            loadFornitori(this.form.fornitore_id),
            loadTeamMembers(this.form.responsabile_id)
        ]);
    }

    setupTipoLavoroHandler() {
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