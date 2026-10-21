package br.ufba.proap.solicitationadminpanel.domain.dto;

import jakarta.validation.constraints.NotNull;

public record DefineAvaliadorDTO(
        Long avaliadorId,
        @NotNull(message = "O ID da solicitação é obrigatório")
        Long solicitacaoId
) {
}
