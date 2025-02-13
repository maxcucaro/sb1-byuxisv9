export class LoadingIndicator {
    constructor(container) {
        this.container = container;
        this.progress = 0;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner">
                    <div class="spinner-circle"></div>
                    <div class="spinner-percentage">0%</div>
                </div>
                <p class="loading-text">Caricamento in corso...</p>
            </div>
        `;

        this.spinnerCircle = this.container.querySelector('.spinner-circle');
        this.spinnerPercentage = this.container.querySelector('.spinner-percentage');
        this.loadingText = this.container.querySelector('.loading-text');
    }

    show() {
        this.container.style.display = 'block';
    }

    hide() {
        this.container.style.display = 'none';
        this.progress = 0;
        this.updateUI();
    }

    updateProgress(percentage, text = null) {
        this.progress = Math.min(Math.max(percentage, 0), 100);
        if (text) {
            this.loadingText.textContent = text;
        }
        this.updateUI();
    }

    updateUI() {
        this.spinnerCircle.style.background = `conic-gradient(from 0deg, var(--accent-color) ${this.progress}%, transparent ${this.progress}%)`;
        this.spinnerPercentage.textContent = `${Math.round(this.progress)}%`;
    }
}

export function createLoadingStyles() {
    return `
        .loading-container {
            text-align: center;
            padding: 3rem;
        }

        .loading-spinner {
            position: relative;
            width: 100px;
            height: 100px;
            margin: 0 auto 1rem;
        }

        .spinner-circle {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: conic-gradient(from 0deg, var(--accent-color) 0%, transparent 0%);
            animation: rotate 2s linear infinite;
            position: relative;
        }

        .spinner-circle::before {
            content: '';
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            bottom: 10px;
            background: white;
            border-radius: 50%;
        }

        .spinner-percentage {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-color);
        }

        .loading-text {
            color: var(--text-color);
            font-size: 1rem;
            margin-top: 1rem;
        }

        @keyframes rotate {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
    `;
}
