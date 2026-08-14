package br.ufba.proap.authentication.domain.dto;

import br.ufba.proap.authentication.domain.enums.ProfileStatus;
import jakarta.validation.constraints.NotBlank;

public record ReviewUserRole(
        @NotBlank
        Long userId,
        @NotBlank
        ProfileStatus status
) {
}
