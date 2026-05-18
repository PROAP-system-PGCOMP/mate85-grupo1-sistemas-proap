-- Criando a tabela data_config dentro do schema proap
CREATE TABLE proap.data_config (
    id BIGSERIAL PRIMARY KEY,
    chave VARCHAR(255) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    descricao VARCHAR(500),
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE proap.data_config IS 'Tabela responsável por armazenar chaves e valores de configuração dinâmica do sistema.';
COMMENT ON COLUMN proap.data_config.chave IS 'Nome único identificador da configuração (ex: LIMITE_TENTATIVAS_LOGIN).';
COMMENT ON COLUMN proap.data_config.valor IS 'O valor associado à configuração.';