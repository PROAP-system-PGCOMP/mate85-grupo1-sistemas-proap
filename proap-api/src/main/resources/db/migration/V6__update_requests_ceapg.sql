-- Atualizações na tabela 'proap_extra_request'
ALTER TABLE proap.proap_extra_request
    ADD COLUMN diferenca_ceapg NUMERIC(19, 4),
    ADD COLUMN status_ceapg VARCHAR(255) DEFAULT 'PENDENTE';

-- Atualizações na tabela 'proap_assistancerequest'
ALTER TABLE proap.proap_assistancerequest
    ADD COLUMN diferenca_ceapg NUMERIC(19, 4),
    ADD COLUMN status_ceapg VARCHAR(255) DEFAULT 'PENDENTE',
    DROP COLUMN IF EXISTS discente_no_prazo_do_curso,
    DROP COLUMN IF EXISTS meses_atraso_curso;