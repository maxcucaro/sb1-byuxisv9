// Componente base per i modali
export class BaseModal {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.setupCloseHandlers();
    }

    show() {
        this.modal.style.display = 'block';
    }

    hide() {
        this.modal.style.display = 'none';
    }

    setupCloseHandlers() {
        const closeBtn = this.modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.onclick = () => this.hide();
        }

        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });
    }
}