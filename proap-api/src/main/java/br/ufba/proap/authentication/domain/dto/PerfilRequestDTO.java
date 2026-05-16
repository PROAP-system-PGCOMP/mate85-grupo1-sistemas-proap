package br.ufba.proap.authentication.domain.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.Set;

public record PerfilRequestDTO(
        @NotBlank String name,
        Set<Long> permissionIds
) {
}
