ALTER TABLE proap.proap_extra_request 
ADD COLUMN IF NOT EXISTS avaliador_ceapg_id BIGINT,
ADD COLUMN IF NOT EXISTS custo_final_ceapg NUMERIC(19, 4),
ADD COLUMN IF NOT EXISTS observacoes_ceapg TEXT,
ADD COLUMN IF NOT EXISTS data_avaliacao_ceapg DATE;

ALTER TABLE proap.proap_extra_request 
ADD CONSTRAINT fk_extra_request_avaliador_ceapg 
FOREIGN KEY (avaliador_ceapg_id) REFERENCES proap.aut_user(id);