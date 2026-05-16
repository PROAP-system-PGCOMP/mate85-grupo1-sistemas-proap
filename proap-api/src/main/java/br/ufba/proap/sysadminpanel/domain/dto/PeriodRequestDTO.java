package br.ufba.proap.sysadminpanel.domain.dto;

import java.time.LocalDateTime;

public record PeriodRequestDTO(LocalDateTime startDate, LocalDateTime endDate) {
}
