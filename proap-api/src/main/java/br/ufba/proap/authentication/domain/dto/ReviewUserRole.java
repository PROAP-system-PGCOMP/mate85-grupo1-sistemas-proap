package br.ufba.proap.authentication.domain.dto;

import br.ufba.proap.authentication.domain.enums.ProfileStatus;
import jakarta.validation.constraints.NotNull;
public record ReviewUserRole(
        @NotNull
        Long userId,
        @NotNull
        ProfileStatus status
) {
}
