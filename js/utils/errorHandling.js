export class DatabaseError extends Error {
    constructor(message, operation) {
        super(message);
        this.name = 'DatabaseError';
        this.operation = operation;
    }
}

export async function handleError(operation, operationName) {
    try {
        return await operation();
    } catch (error) {
        console.error(`Errore durante ${operationName}:`, error);
        
        // Gestione errori specifici
        if (error.code === 'PGRST301') {
            throw new DatabaseError('Risorsa non trovata', operationName);
        }
        
        if (error.code === 'PGRST204') {
            throw new DatabaseError('Errore di validazione dati', operationName);
        }

        throw new DatabaseError(
            error.message || `Errore durante ${operationName}`,
            operationName
        );
    }
}

export function displayError(error, container) {
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                ${error.message || 'Si è verificato un errore imprevisto'}
            </div>
        `;
    } else {
        alert(error.message || 'Si è verificato un errore imprevisto');
    }
}