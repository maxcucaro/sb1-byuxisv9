import { teamService } from '../../services/teamService.js';

export async function loadTeamMembers() {
    const select = document.getElementById('responsabile_id');
    if (!select) return;
    
    const team = await teamService.getTeam();
    if (team.success) {
        team.data.forEach(membro => {
            if (membro.attivo) {
                const option = document.createElement('option');
                option.value = membro.id;
                option.textContent = `${membro.nome} ${membro.cognome}`;
                select.appendChild(option);
            }
        });
    }
}