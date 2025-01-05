-- Update tipologie_lavoro table to include RESO_FORNITORE
INSERT INTO tipologie_lavoro (tipo, attivo, richiedi_cliente, richiedi_preventivo, richiedi_ddt) 
VALUES ('RESO_FORNITORE', true, false, false, true);