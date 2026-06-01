package br.ufba.proap.authentication.domain.dto;

import jakarta.validation.constraints.NotNull;

public record sendEmailCreateAccountDTO (
        @NotNull
        String email
) {
}
