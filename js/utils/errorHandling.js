export class DatabaseError extends Error {
    constructor(message, operation, retryable = true) {
        super(message);
        this.name = 'DatabaseError';
        this.operation = operation;
        this.retryable = retryable;
    }
}

export async function handleError(operation, operationName) {
    try {
        return await operation();
    } catch (error) {
        console.error(`Errore durante ${operationName}:`, error);
        
        // Gestione errori di connessione
        if (error.message === 'Failed to fetch' || error.message === 'Timeout connessione') {
            throw new DatabaseError(
                'Errore di connessione al database. Riprova tra qualche istante.',
                operationName,
                true
            );
        }
        
        // Gestione errori specifici
        if (error.code === 'PGRST301') {
            throw new DatabaseError('Risorsa non trovata', operationName, false);
        }
        
        if (error.code === 'PGRST204') {
            throw new DatabaseError('Errore di validazione dati', operationName, false);
        }

        throw new DatabaseError(
            error.message || `Errore durante ${operationName}`,
            operationName,
            error instanceof DatabaseError ? error.retryable : true
        );
    }
}

export function displayError(error, container) {
    const message = error instanceof DatabaseError ?
        `Errore durante ${error.operation}: ${error.message}${error.retryable ? '\nRiprova tra qualche istante.' : ''}` :
        error.message || 'Si è verificato un errore imprevisto';

    if (container) {
        container.innerHTML = `
            <div class="error-message">
                ${message}
            </div>
        `;
    } else {
        alert(message);
    }
}