package br.ufba.proap.authentication.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreateUserDTO(
        @NotBlank @Pattern(
                regexp = "^[A-Za-z0-9._%+-]+@ufba\\.br$",
                message = "Apenas e-mails do domínio @ufba.br são permitidos."
        ) String email,
        @NotBlank String password, @NotBlank String name,
        @NotBlank String cpf, @NotBlank String registration, String phone,
        String alternativePhone) {
}
