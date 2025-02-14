import { settoriService } from '../services/settoriService.js';
import { SETTORI } from '../utils/constants.js';

export function createArticoloModal() {
    const modalHTML = `
        <div id="articoloModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>GESTIONE ARTICOLO</h3>
                    <span class="close-modal">&times;</span>
                </div>

                <form id="articoloForm" class="modal-form">
                    <div class="form-grid">
                        <div class="form-group settore-group">
                            <label for="settore" class="required-field">Settore</label>
                            <select id="settore" name="settore" class="form-control" required>
                                <option value="">Seleziona settore</option>
                                ${Object.entries(SETTORI).map(([key, value]) => `
                                    <option value="${key}">${value.nome}</option>
                                `).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="categoria" class="required-field">Categoria</label>
                            <select id="categoria" name="categoria" class="form-control" required>
                                <option value="">Seleziona categoria</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="descrizione" class="required-field">Descrizione</label>
                            <input type="text" id="descrizione" name="descrizione" required 
                                   class="form-control" autocomplete="off">
                        </div>

                        <div class="form-group">
                            <label for="quantita" class="required-field">Quantità</label>
                            <div class="quantity-control">
                                <button type="button" class="quantity-btn minus">-</button>
                                <input type="number" id="quantita" name="quantita" min="0" value="0" required 
                                       class="form-control quantity-input">
                                <button type="button" class="quantity-btn plus">+</button>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="ubicazione">Ubicazione</label>
                            <input type="text" id="ubicazione" name="ubicazione" class="form-control">
                        </div>

                        <div class="form-group status-group">
                            <label class="status-toggle">
                                <input type="checkbox" id="attivo" name="attivo" checked>
                                <span class="status-slider"></span>
                                <span class="status-label">Articolo attivo</span>
                            </label>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="button primary-button">Salva</button>
                        <button type="button" class="button secondary-button cancel-button">Annulla</button>
                    </div>
                </form>
            </div>
        </div>

        <style>
            .modal-header {
                background: var(--primary-color);
                color: white;
                padding: 1.25rem;
                border-radius: 0.5rem 0.5rem 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .modal-header h3 {
                margin: 0;
                font-size: 1.25rem;
                font-weight: 600;
            }

            .close-modal {
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                transition: opacity 0.2s;
            }

            .close-modal:hover {
                opacity: 0.8;
            }

            .modal-form {
                padding: 1.5rem;
            }

            .form-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1.5rem;
            }

            .form-group {
                margin-bottom: 1rem;
            }

            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
                color: var(--text-color);
            }

            .form-control {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid var(--border-color);
                border-radius: 0.375rem;
                font-size: 1rem;
                transition: border-color 0.2s;
            }

            .form-control:focus {
                outline: none;
                border-color: var(--accent-color);
                box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.1);
            }

            .quantity-control {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .quantity-btn {
                padding: 0.5rem 1rem;
                border: 1px solid var(--border-color);
                background: white;
                border-radius: 0.375rem;
                cursor: pointer;
                transition: all 0.2s;
            }

            .quantity-btn:hover {
                background: var(--background-color);
            }

            .quantity-input {
                width: 100px;
                text-align: center;
            }

            .status-group {
                grid-column: span 2;
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid var(--border-color);
            }

            .status-toggle {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
            }

            .status-slider {
                position: relative;
                width: 3rem;
                height: 1.5rem;
                background: #E5E7EB;
                border-radius: 9999px;
                transition: background-color 0.2s;
            }

            .status-toggle input:checked + .status-slider {
                background: #10B981;
            }

            .status-slider:before {
                content: "";
                position: absolute;
                left: 0.25rem;
                top: 0.25rem;
                width: 1rem;
                height: 1rem;
                background: white;
                border-radius: 50%;
                transition: transform 0.2s;
            }

            .status-toggle input:checked + .status-slider:before {
                transform: translateX(1.5rem);
            }

            .status-toggle input {
                display: none;
            }

            .status-label {
                font-weight: 500;
                color: var(--text-color);
            }

            .form-actions {
                margin-top: 2rem;
                padding-top: 1.5rem;
                border-top: 1px solid var(--border-color);
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
            }

            .primary-button {
                background: var(--accent-color);
                color: white;
            }

            .primary-button:hover {
                background: #0284C7;
            }

            .secondary-button {
                background: #E5E7EB;
                color: var(--text-color);
            }

            .secondary-button:hover {
                background: #D1D5DB;
            }

            .required-field::after {
                content: "*";
                color: #ef4444;
                margin-left: 0.25rem;
            }

            @media (max-width: 768px) {
                .form-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    `;

    // Remove existing modal if present
    const existingModal = document.getElementById('articoloModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('articoloModal');
    const form = modal.querySelector('#articoloForm');
    const settoreSelect = form.querySelector('#settore');
    const categoriaSelect = form.querySelector('#categoria');
    const quantityInput = form.querySelector('#quantita');
    const minusBtn = form.querySelector('.quantity-btn.minus');
    const plusBtn = form.querySelector('.quantity-btn.plus');
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.cancel-button');

    // Setup quantity controls
    minusBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value) || 0;
        if (currentValue > 0) {
            quantityInput.value = currentValue - 1;
        }
    });

    plusBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value) || 0;
        quantityInput.value = currentValue + 1;
    });

    // Setup close handlers
    const closeModal = () => {
        modal.style.display = 'none';
        form.reset();
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Setup settore change handler
    settoreSelect.addEventListener('change', async () => {
        const settore = settoreSelect.value;
        if (!settore) return;

        try {
            const result = await settoriService.getCategorieBySettore(settore);
            if (!result.success) throw new Error(result.error);

            categoriaSelect.innerHTML = '<option value="">Seleziona categoria</option>';
            result.data
                .filter(cat => cat.attivo)
                .sort((a, b) => a.categoria.localeCompare(b.categoria))
                .forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.categoria;
                    option.textContent = cat.categoria;
                    categoriaSelect.appendChild(option);
                });
        } catch (error) {
            console.error('Errore caricamento categorie:', error);
            alert('Errore durante il caricamento delle categorie: ' + error.message);
        }
    });

    return modal;
}