import { schedeLavoroService } from '../../services/schedeLavoroService.js';

export function navigateToNuovaScheda() {
    window.location.href = 'pages/schede/nuova-scheda.html';
}

export function navigateToVisualizzaScheda(id) {
    window.location.href = `../../pages/schede/visualizza-scheda.html?id=${id}`;
}

export function navigateToModificaScheda(id) {
    window.location.href = `../../pages/schede/modifica-scheda.html?id=${id}`;
}

export function navigateToListaSchede(tipo) {
    window.location.href = `../../pages/schede/lista-schede.html?tipo=${tipo}`;
}

export function navigateBack() {
    window.history.back();
}