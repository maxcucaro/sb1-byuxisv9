import { jsPDF } from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/+esm';
import 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.1/dist/jspdf.plugin.autotable.min.js';
import { companyProfileService } from './companyProfileService.js';

class PdfService {
    async addHeader(doc, title) {
        try {
            // Recupera il logo e i dati aziendali
            const [logoResult, profileResult] = await Promise.all([
                companyProfileService.getLogo(),
                companyProfileService.getProfile()
            ]);

            const startY = 20;
            let currentY = startY;

            // Aggiungi il logo se presente
            if (logoResult.success && logoResult.data) {
                const img = new Image();
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = logoResult.data;
                });

                // Calcola dimensioni logo mantenendo aspect ratio
                const maxWidth = 60;
                const maxHeight = 30;
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = (maxWidth * height) / width;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (maxHeight * width) / height;
                    height = maxHeight;
                }

                doc.addImage(img, 'PNG', 20, currentY, width, height);
                currentY = startY + height + 5;
            }

            // Aggiungi titolo documento
            doc.setFontSize(20);
            doc.text(title, 105, currentY, { align: 'center' });
            currentY += 15;

            // Aggiungi dati aziendali se disponibili
            if (profileResult.success) {
                const profile = profileResult.data;
                doc.setFontSize(10);
                doc.setTextColor(100);

                const companyInfo = [
                    profile.ragione_sociale,
                    profile.indirizzo ? `${profile.indirizzo} - ${profile.cap} ${profile.citta} (${profile.provincia})` : '',
                    `P.IVA: ${profile.piva}`,
                    profile.telefono ? `Tel: ${profile.telefono}` : '',
                    profile.email ? `Email: ${profile.email}` : ''
                ].filter(Boolean);

                companyInfo.forEach(line => {
                    doc.text(line, 105, currentY, { align: 'center' });
                    currentY += 5;
                });
            }

            doc.setTextColor(0);
            return currentY + 10; // Ritorna la posizione Y per il contenuto successivo

        } catch (error) {
            console.error('Errore durante l\'aggiunta dell\'intestazione:', error);
            // In caso di errore, ritorna una posizione Y di default
            return 40;
        }
    }

    async generateSopralluogoReport(sopralluogo) {
        const doc = new jsPDF();
        
        // Aggiungi intestazione
        const startY = await this.addHeader(doc, 'SOPRALLUOGO TECNICO');
        
        // Informazioni base
        doc.setFontSize(12);
        doc.text(`Codice: ${sopralluogo.codice}`, 20, startY);
        doc.text(`Evento: ${sopralluogo.evento_nome}`, 20, startY + 10);
        doc.text(`Tipo: ${sopralluogo.tipo_lavoro}`, 20, startY + 20);
        doc.text(`Date: ${new Date(sopralluogo.data_inizio).toLocaleDateString()} - ${new Date(sopralluogo.data_fine).toLocaleDateString()}`, 20, startY + 30);
        doc.text(`Luogo: ${sopralluogo.luogo}`, 20, startY + 40);
        
        let currentY = startY + 60;

        // Funzione helper per aggiungere sezioni
        const addSection = (title, content, startY) => {
            doc.setFontSize(14);
            doc.setTextColor(14, 165, 233);
            doc.text(title, 20, startY);
            doc.setTextColor(0);
            doc.setFontSize(10);

            if (typeof content === 'object') {
                const contentLines = Object.entries(content)
                    .filter(([_, value]) => value)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n');
                const lines = doc.splitTextToSize(contentLines, 170);
                doc.text(lines, 20, startY + 10);
                return startY + 10 + (lines.length * 5);
            } else {
                const contentLines = doc.splitTextToSize(content || '-', 170);
                doc.text(contentLines, 20, startY + 10);
                return startY + 10 + (contentLines.length * 5);
            }
        };

        // Location
        if (sopralluogo.location_nome || sopralluogo.location_indirizzo) {
            const locationContent = {
                'Nome': sopralluogo.location_nome,
                'Indirizzo': sopralluogo.location_indirizzo,
                'Referente': sopralluogo.location_referente,
                'Dimensioni': `${sopralluogo.location_lunghezza || '-'} x ${sopralluogo.location_larghezza || '-'}`,
                'Posizione Regia': sopralluogo.location_posizione_regia,
                'Distanza Regia-Palco': sopralluogo.location_distanza_regia_palco
            };
            currentY = addSection('Location', locationContent, currentY) + 10;
        }

        // Accessibilità
        if (sopralluogo.accessibilita_parcheggio || sopralluogo.accessibilita_carico_scarico || sopralluogo.accessibilita_ascensori) {
            const accessContent = {
                'Parcheggio': sopralluogo.accessibilita_parcheggio,
                'Carico/Scarico': sopralluogo.accessibilita_carico_scarico,
                'Ascensori': sopralluogo.accessibilita_ascensori
            };
            currentY = addSection('Accessibilità', accessContent, currentY) + 10;
        }

        // Verifica se serve una nuova pagina
        if (currentY > 250) {
            doc.addPage();
            currentY = 20;
        }

        // Piano Lavoro
        const pianoContent = {
            'Scarico': sopralluogo.dati_tecnici_scarico,
            'Montaggio': sopralluogo.dati_tecnici_montaggio,
            'Prove': sopralluogo.dati_tecnici_prove,
            'Evento': sopralluogo.dati_tecnici_evento,
            'Smontaggio': sopralluogo.dati_tecnici_smontaggio,
            'Ricarico': sopralluogo.dati_tecnici_ricarico
        };
        currentY = addSection('Piano Lavoro', pianoContent, currentY) + 10;

        // Nuova pagina per dettagli tecnici
        doc.addPage();
        currentY = 20;

        // Palco
        const palcoContent = {
            'Lunghezza': sopralluogo.palco_lunghezza,
            'Larghezza': sopralluogo.palco_larghezza,
            'Altezza': sopralluogo.palco_altezza
        };
        currentY = addSection('Palco', palcoContent, currentY) + 10;

        // Strutture
        const struttureContent = {
            'Pedanamento': this.formatJsonbField(sopralluogo.strutture_pedanamento),
            'Truss': this.formatJsonbField(sopralluogo.strutture_truss),
            'Elevatori': this.formatJsonbField(sopralluogo.strutture_elevatori),
            'Motori': this.formatJsonbField(sopralluogo.strutture_motori),
            'Ancoraggi/Zavorre': sopralluogo.strutture_ancoraggi_zavorre
        };
        currentY = addSection('Strutture', struttureContent, currentY) + 10;

        // Video
        const videoContent = {
            'LED Wall': this.formatJsonbField(sopralluogo.video_ledwall),
            'Proiezione': this.formatJsonbField(sopralluogo.video_proiezione),
            'Monitor': this.formatJsonbField(sopralluogo.video_monitor),
            'Riprese': this.formatJsonbField(sopralluogo.video_riprese),
            'PC Contributi': sopralluogo.video_pc_contributi || '0',
            'PC Slide': sopralluogo.video_pc_slide || '0',
            'Regia Grafica': sopralluogo.video_regia_grafica,
            'Regia Video': sopralluogo.video_regia_video,
            'Registrazione': this.formatJsonbField(sopralluogo.video_registrazione),
            'Monitor Rimando': this.formatJsonbField(sopralluogo.video_monitor_rimando),
            'Streaming': this.formatJsonbField(sopralluogo.video_streaming),
            'Note': sopralluogo.video_note
        };
        currentY = addSection('Video', videoContent, currentY) + 10;

        // Nuova pagina se necessario
        if (currentY > 250) {
            doc.addPage();
            currentY = 20;
        }

        // Audio
        const audioContent = {
            'Regia': this.formatJsonbField(sopralluogo.audio_regia),
            'PA System': this.formatJsonbField(sopralluogo.audio_pa),
            'Delay': this.formatJsonbField(sopralluogo.audio_delay),
            'Monitor': this.formatJsonbField(sopralluogo.audio_monitor),
            'Ascolti Cuffia': this.formatJsonbField(sopralluogo.audio_ascolti_cuffia),
            'Radiomicrofoni': this.formatJsonbField(sopralluogo.audio_radiomicrofoni),
            'Microfoni Podio': sopralluogo.audio_mic_podio || '0',
            'Microfoni Tavolo': sopralluogo.audio_mic_tavolo || '0',
            'Intercom': this.formatJsonbField(sopralluogo.audio_intercom),
            'Note': sopralluogo.audio_note
        };
        currentY = addSection('Audio', audioContent, currentY) + 10;

        // Luci
        const luciContent = {
            'Mixer': sopralluogo.luci_mixer,
            'Piazzato': this.formatJsonbField(sopralluogo.luci_piazzato),
            'Teste Mobili': this.formatJsonbField(sopralluogo.luci_motorizzati),
            'Proiettori Batteria': this.formatJsonbField(sopralluogo.luci_proiettori_batteria),
            'Effetti Speciali': this.formatJsonbField(sopralluogo.luci_special_fx),
            'Dimmer': sopralluogo.luci_dimmer || '0',
            'Colori/Temi': sopralluogo.luci_colori_temi,
            'Gobos Personalizzati': sopralluogo.luci_gobos_personalizzato ? 'Sì' : 'No',
            'Esigenze Specifiche': sopralluogo.luci_esigenze_specifiche,
            'Note': sopralluogo.luci_note
        };
        currentY = addSection('Luci', luciContent, currentY) + 10;

        // Nuova pagina se necessario
        if (currentY > 250) {
            doc.addPage();
            currentY = 20;
        }

        // Corrente
        const correnteContent = {
            'Potenza': sopralluogo.corrente_potenza,
            'Prese': sopralluogo.corrente_prese,
            'Disposizione': sopralluogo.corrente_disposizione,
            'Tipologia Prese': sopralluogo.corrente_tipologia_prese,
            'Generatori': this.formatJsonbField(sopralluogo.corrente_generatori_richiesti),
            'Linea Monofase': sopralluogo.corrente_linea_monofase,
            'Linea Trifase': sopralluogo.corrente_linea_trifase,
            'UPS': sopralluogo.corrente_ups,
            'Note': sopralluogo.corrente_note
        };
        currentY = addSection('Corrente', correnteContent, currentY) + 10;

        // Personale
        const personaleContent = {
            'Video': this.formatJsonbField(sopralluogo.personale_video),
            'Audio': this.formatJsonbField(sopralluogo.personale_audio),
            'Luci': this.formatJsonbField(sopralluogo.personale_luci),
            'Facchini': this.formatJsonbField(sopralluogo.personale_facchini),
            'Altro': this.formatJsonbField(sopralluogo.personale_altro)
        };
        currentY = addSection('Personale', personaleContent, currentY) + 10;

        // Nuova pagina se necessario
        if (currentY > 250) {
            doc.addPage();
            currentY = 20;
        }

        // Richieste
        const richiesteContent = {
            'Permessi': sopralluogo.richieste_permessi,
            'Certificazioni': sopralluogo.richieste_certificazioni,
            'Vestiario': sopralluogo.richieste_vestiario
        };
        currentY = addSection('Richieste', richiesteContent, currentY) + 10;

        // Allestimento
        const allestimentoContent = {
            'Rivestimento Palco': this.formatJsonbField(sopralluogo.allestimento_rivestimento_palco),
            'Tamponatura Perimetrale': this.formatJsonbField(sopralluogo.allestimento_tamponatura_perimetrale),
            'Totem/Quinta': this.formatJsonbField(sopralluogo.allestimento_totem_quinta),
            'Tamponatura LED Wall': this.formatJsonbField(sopralluogo.allestimento_tamponatura_ledwall),
            'Tamponatura Regia': this.formatJsonbField(sopralluogo.allestimento_tamponatura_regia),
            'Tamponatura Truss': this.formatJsonbField(sopralluogo.allestimento_tamponatura_truss)
        };
        currentY = addSection('Allestimento', allestimentoContent, currentY) + 10;

        // Note Aggiuntive
        if (sopralluogo.altro) {
            currentY = addSection('Note Aggiuntive', sopralluogo.altro, currentY) + 10;
        }

        // Aggiungi piè di pagina
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(
                `Pagina ${i} di ${pageCount}`,
                doc.internal.pageSize.width / 2,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
        }
        
        // Scarica il PDF
        doc.save(`sopralluogo_${sopralluogo.codice}.pdf`);
    }

    formatJsonbField(field) {
        if (!field) return '-';
        try {
            if (typeof field === 'string') {
                field = JSON.parse(field);
            }
            return Object.entries(field)
                .filter(([_, value]) => value)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ') || '-';
        } catch (error) {
            return String(field) || '-';
        }
    }
}

export const pdfService = new PdfService();