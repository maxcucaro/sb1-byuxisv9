export function getReferenceValue(scheda, tipo, typeConfig) {
    const config = typeConfig[tipo];
    if (!config) return null;

    switch (config.ref) {
        case 'produzione':
            return scheda.produzione?.nome;
        case 'cliente':
            return scheda.cliente?.ragione_sociale;
        case 'fornitore':
            return scheda.fornitore?.ragione_sociale;
        case 'cat':
            return scheda.cat ? `${scheda.cat.nome} ${scheda.cat.cognome}` : null;
        default:
            return null;
    }
}