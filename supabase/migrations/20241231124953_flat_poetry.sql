-- Update default configurations for each tipo
UPDATE tipologie_lavoro 
SET 
    richiedi_cliente = CASE 
        WHEN tipo = 'INTERNO' THEN false
        WHEN tipo = 'NOLEGGIO' THEN true
        WHEN tipo = 'CONTOVISIONE' THEN true
        WHEN tipo = 'ASSISTENZA' THEN true
    END,
    richiedi_preventivo = CASE 
        WHEN tipo = 'INTERNO' THEN false
        WHEN tipo = 'NOLEGGIO' THEN true
        WHEN tipo = 'CONTOVISIONE' THEN false
        WHEN tipo = 'ASSISTENZA' THEN true
    END,
    richiedi_ddt = CASE 
        WHEN tipo = 'INTERNO' THEN false
        WHEN tipo = 'NOLEGGIO' THEN true
        WHEN tipo = 'CONTOVISIONE' THEN true
        WHEN tipo = 'ASSISTENZA' THEN false
    END;