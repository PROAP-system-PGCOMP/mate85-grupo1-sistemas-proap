-- Tarifas de diária nacional por perfil/localidade
-- Aluno: valor padrão; Docente: valor padrão e valor para as capitais SP e RJ.
ALTER TABLE proap.proap_system_configuration
    ADD COLUMN IF NOT EXISTS valor_diaria_aluno_brl          NUMERIC(19, 4),
    ADD COLUMN IF NOT EXISTS valor_diaria_docente_brl        NUMERIC(19, 4),
    ADD COLUMN IF NOT EXISTS valor_diaria_docente_sp_rj_brl  NUMERIC(19, 4);

-- Preserva o valor global anterior (valor_diariabrl) como valor do aluno.
UPDATE proap.proap_system_configuration
SET valor_diaria_aluno_brl         = COALESCE(valor_diaria_aluno_brl, valor_diariabrl, 320),
    valor_diaria_docente_brl       = COALESCE(valor_diaria_docente_brl, 380),
    valor_diaria_docente_sp_rj_brl = COALESCE(valor_diaria_docente_sp_rj_brl, 425);

-- Grupo de países escolhido na solicitação (viagens internacionais)
ALTER TABLE proap.proap_assistancerequest
    ADD COLUMN IF NOT EXISTS country_group VARCHAR(50);

-- Resolução de países duplicados entre grupos do CNPq:
-- o país permanece apenas no grupo de maior valor (keep_group).
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT * FROM (VALUES
            ('Romênia',      'B'),
            ('Turcomenistão','B'),
            ('Guatemala',    'C'),
            ('Letônia',      'C'),
            ('Ucrânia',      'C'),
            ('Barbados',     'D'),
            ('Canadá',       'D'),
            ('Hong Kong',    'D')
        ) AS t(country, keep_group)
    LOOP
        UPDATE proap.proap_country_group
        SET countries = array_to_string(array_remove(string_to_array(countries, ','), r.country), ',')
        WHERE group_name <> r.keep_group
          AND countries IS NOT NULL
          AND r.country = ANY (string_to_array(countries, ','));
    END LOOP;
END $$;
