package br.ufba.proap.authentication.domain.dto;

import br.ufba.proap.authentication.domain.User;

public record UserNormalResponseDTO(
        Long id,
        String name,
        String email,
        String cpf,
        String registration,
        String phone,
        String alternativePhone,
        String perfilName
) {
    public UserNormalResponseDTO(User user) {
        this(user.getId(), user.getName(), user.getEmail(), user.getCpf(), user.getRegistration(), user.getPhone(), user.getAlternativePhone(), user.getPerfil().getName());
    }
}
