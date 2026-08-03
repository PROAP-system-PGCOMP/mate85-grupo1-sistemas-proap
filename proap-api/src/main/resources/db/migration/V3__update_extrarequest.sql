ALTER TABLE proap.proap_extra_request
ADD COLUMN avaliador_ceapg_id BIGINT;

ALTER TABLE proap.proap_extra_request
ADD COLUMN custo_final_ceapg NUMERIC(19, 4);

ALTER TABLE proap.proap_extra_request
ADD COLUMN observacoes_ceapg TEXT;

ALTER TABLE proap.proap_extra_request
ADD COLUMN data_avaliacao_ceapg DATE;

ALTER TABLE proap.proap_extra_request
ADD CONSTRAINT fk_extra_request_avaliador_ceapg
FOREIGN KEY (avaliador_ceapg_id) REFERENCES proap.user(id);