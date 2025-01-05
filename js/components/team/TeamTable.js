import { formatDate } from '../../utils/dateUtils.js';

export function createTeamTable(membri) {
    if (!membri?.length) {
        return `
            <tr>
                <td colspan="7" class="no-data">
                    Nessun membro del team trovato
                </td>
            </tr>`;
    }

    return membri.map(membro => `
        <tr>
            <td>${membro.codice}</td>
            <td>${membro.nome} ${membro.cognome}</td>
            <td>${membro.ruolo}</td>
            <td>${membro.telefono || '-'}</td>
            <td>${membro.email || '-'}</td>
            <td class="${membro.attivo ? 'status-active' : 'status-inactive'}">
                ${membro.attivo ? 'Attivo' : 'Inattivo'}
            </td>
            <td>
                <button onclick="window.modificaDipendente('${membro.id}')" class="button">
                    Modifica
                </button>
                <button onclick="window.modificaRuolo('${membro.id}')" class="button">
                    Cambia Ruolo
                </button>
                <button onclick="window.toggleStatoDipendente('${membro.id}', ${membro.attivo})" class="button">
                    ${membro.attivo ? 'Disattiva' : 'Attiva'}
                </button>
            </td>
        </tr>
    `).join('');
}