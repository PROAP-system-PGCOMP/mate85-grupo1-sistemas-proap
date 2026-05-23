package br.ufba.proap.authentication.domain.dto;

import br.ufba.proap.authentication.domain.Permission;

public record PermissionDTO(
        Long id,
        String key,
        String description,
        boolean enabled
) {

    public PermissionDTO(Permission permission) {
        this(
                permission.getId(),
                permission.getKey(),
                permission.getDescription(),
                permission.isEnabled()
        );
    }
}
