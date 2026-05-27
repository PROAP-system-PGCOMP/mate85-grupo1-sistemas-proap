package br.ufba.proap.solicitationadminpanel.domain.dto;

import java.math.BigDecimal;

public record CeapgReviewDTO(BigDecimal valorFinal, String observacoes, String numeroAta) {
}
