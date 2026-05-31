package br.ufba.proap.authentication.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserUpdateDTO {

    private String name;
    private String registrationNumber;
    @NotBlank(message = "O telefone é obrigatório")
    @Pattern(regexp = "^\\d{10,11}$", message = "O telefone deve conter apenas números e ter 10 ou 11 dígitos (com DDD)")
    private String phone;
    @Pattern(regexp = "^\\d{10,11}$", message = "O telefone alternativo deve conter apenas números e ter 10 ou 11 dígitos (com DDD)")
    private String alternativePhone;

}
