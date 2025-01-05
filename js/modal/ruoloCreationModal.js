export function createRuoloCreationModal() {
    const modalHTML = `
        <div id="ruoloCreationModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Crea Nuovo Ruolo</h3>
                <form id="ruoloCreationForm">
                    <div class="form-group">
                        <label for="nome_ruolo">Nome Ruolo*</label>
                        <input type="text" id="nome_ruolo" name="nome_ruolo" required 
                               placeholder="Inserisci il nome del nuovo ruolo">
                    </div>
                    <div class="form-group">
                        <label for="descrizione_ruolo">Descrizione</label>
                        <textarea id="descrizione_ruolo" name="descrizione_ruolo" rows="3" 
                                placeholder="Inserisci una descrizione per il ruolo"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Permessi</label>
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" name="permessi" value="LETTURA"> Lettura
                            </label>
                            <label>
                                <input type="checkbox" name="permessi" value="SCRITTURA"> Scrittura
                            </label>
                            <label>
                                <input type="checkbox" name="permessi" value="MODIFICA"> Modifica
                            </label>
                            <label>
                                <input type="checkbox" name="permessi" value="ELIMINAZIONE"> Eliminazione
                            </label>
                            <label>
                                <input type="checkbox" name="permessi" value="AMMINISTRAZIONE"> Amministrazione
                            </label>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="button">Salva</button>
                        <button type="button" class="button" onclick="document.getElementById('ruoloCreationModal').style.display='none'">Annulla</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}