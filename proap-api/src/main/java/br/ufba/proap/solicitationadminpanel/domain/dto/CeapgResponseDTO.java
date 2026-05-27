package br.ufba.proap.solicitationadminpanel.domain.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CeapgResponseDTO(Long id, BigDecimal valorAprovado, LocalDate dataAvaliacaoProap, String avaliadorProap,
        BigDecimal custoFinalCeapg, String observacoesCeapg, String avaliadorCeapg, LocalDate dataAvaliacaoCeapg, String numeroAta) {

}
