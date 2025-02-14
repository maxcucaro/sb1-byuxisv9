export class Sidebar {
    constructor(options = {}) {
        this.options = {
            position: 'left',
            width: options.width || '280px',
            theme: 'dark'
        };
        
        this.isOpen = false;
        this.init();
    }

    init() {
        // Create vertical stripe
        this.stripe = document.createElement('div');
        this.stripe.className = 'sidebar-stripe';
        this.stripe.addEventListener('click', () => this.toggle());
        
        // Create sidebar container
        this.container = document.createElement('div');
        this.container.className = 'sidebar';
        this.container.style.setProperty('--sidebar-width', this.options.width);
        
        // Create content container
        this.content = document.createElement('div');
        this.content.className = 'sidebar-content';
        
        // Assemble sidebar
        this.container.appendChild(this.content);
        document.body.appendChild(this.stripe);
        document.body.appendChild(this.container);

        // Add keyboard listener
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    }

    setContent(html) {
        this.content.innerHTML = html;
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        this.container.classList.add('open');
        this.stripe.classList.add('active');
    }

    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.container.classList.remove('open');
        this.stripe.classList.remove('active');
    }
}