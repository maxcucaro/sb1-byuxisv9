```javascript
export function createWorkOrderRow(scheda) {
    return {
        codice: scheda.codice,
        nome: scheda.nome,
        produzione: scheda.produzione?.nome || '-',
        dataInizio: new Date(scheda.data_inizio).toLocaleDateString(),
        dataFine: new Date(scheda.data_fine).toLocaleDateString(),
        luogo: scheda.luogo,
        responsabile: scheda.responsabile || '-',
        stato: scheda.stato,
        id: scheda.id
    };
}
```