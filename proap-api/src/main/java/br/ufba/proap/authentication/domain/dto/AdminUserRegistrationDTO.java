package br.ufba.proap.authentication.domain.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminUserRegistrationDTO(
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotBlank String cpf,
        @NotBlank String registration,
        @NotBlank String phone,
        String alternativePhone
) {
}