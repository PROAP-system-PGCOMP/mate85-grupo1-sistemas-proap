package br.ufba.proap.authentication.domain.dto;

import br.ufba.proap.authentication.domain.Perfil;

import java.util.Set;
import java.util.stream.Collectors;

public record PerfilResponseDTO(
        Long id,
        String name,
        Set<PermissionDTO> permissions
) {
    public PerfilResponseDTO(Perfil perfil) {
        this(
                perfil.getId(),
                perfil.getName(),
                perfil.getPermissions().stream()
                        .map(PermissionDTO::new)
                        .collect(Collectors.toSet())
        );
    }
}
