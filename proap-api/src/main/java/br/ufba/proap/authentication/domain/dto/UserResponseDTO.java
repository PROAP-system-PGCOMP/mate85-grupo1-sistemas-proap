package br.ufba.proap.authentication.domain.dto;

import br.ufba.proap.authentication.domain.User;
import java.math.BigDecimal;

public record UserResponseDTO(
        Long id,
        String name,
        String email,
        String cpf,
        String registrationNumber,
        String phone,
        String alternativePhone,
        String profileName,
        BigDecimal requestedNormalAmount,
        BigDecimal aproveNormalAmount,
        BigDecimal requestedExtraAmount,
        BigDecimal aprovedExtraAmount
) {

    public static UserResponseDTO fromUser(User user) {
        if (user == null) return null;

        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCpf(),
                user.getRegistration(),
                user.getPhone(),
                user.getAlternativePhone(),
                user.getPerfil() != null ? user.getPerfil().getName() : null, // Ajuste para o seu getter de perfil se necessário
                BigDecimal.ZERO, // Valor padrão se a busca não vier da query de ranking
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO
        );
    }

    // Método 2: Mantém o método que recebe os valores soltos
    public static UserResponseDTO fromUser(Long id, String name, String email, String cpf, String registrationNumber, String phone,
                                           String alternativePhone, String profileName, BigDecimal requestedNormalAmount, BigDecimal aproveNormalAmount,
                                           BigDecimal requestedExtraAmount, BigDecimal aprovedExtraAmount) {
        return new UserResponseDTO(id, name, email, cpf, registrationNumber, phone, alternativePhone, profileName,
                requestedNormalAmount, aproveNormalAmount, requestedExtraAmount, aprovedExtraAmount);
    }
}