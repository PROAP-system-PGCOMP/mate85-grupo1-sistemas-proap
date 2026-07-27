package br.ufba.proap.authentication.domain.dto;

import br.ufba.proap.authentication.domain.User;

import java.math.BigDecimal;

public record UserResponseDTO(Long id, String name, String email, String cpf, String registrationNumber, String phone,
                              String alternativePhone, String profileName, BigDecimal requestedNormalAmount, BigDecimal aproveNormalAmount,
                              BigDecimal requestedExtraAmount, BigDecimal aprovedExtraAmount) {

        public static UserResponseDTO fromUser(Long id, String name, String email, String cpf, String registrationNumber, String phone,
                                               String alternativePhone, String profileName, BigDecimal requestedNormalAmount, BigDecimal aproveNormalAmount,
                                               BigDecimal requestedExtraAmount, BigDecimal aprovedExtraAmount) {
            return new UserResponseDTO(id, name, email, cpf, registrationNumber, phone, alternativePhone, profileName, requestedNormalAmount, aproveNormalAmount,
                    requestedExtraAmount, aprovedExtraAmount);
        }
    }
