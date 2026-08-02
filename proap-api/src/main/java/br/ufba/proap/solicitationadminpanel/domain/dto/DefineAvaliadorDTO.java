package br.ufba.proap.solicitationadminpanel.domain.dto;

import jakarta.validation.constraints.NotBlank;

public record DefineAvaliadorDTO(
        @NotBlank
        Long avaliadorId,
        @NotBlank
        Long solicitacaoId
) {
}
