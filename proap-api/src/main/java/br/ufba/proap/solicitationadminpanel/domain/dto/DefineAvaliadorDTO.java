package br.ufba.proap.solicitationadminpanel.domain.dto;

import jakarta.validation.constraints.NotNull;

public record DefineAvaliadorDTO(
        @NotNull(message = "O ID do avaliador é obrigatório")
        Long avaliadorId,
        @NotNull(message = "O ID da solicitação é obrigatório")
        Long solicitacaoId
) {
}
