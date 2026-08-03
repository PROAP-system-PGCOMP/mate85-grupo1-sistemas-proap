package br.ufba.proap.solicitationadminpanel.domain.dto;

import java.time.LocalDate;

public record FindAprovedExtraRequestDTO (
        LocalDate start,
        LocalDate end
){
}
