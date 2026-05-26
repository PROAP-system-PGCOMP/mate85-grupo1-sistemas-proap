package br.ufba.proap.sysadminpanel.domain.dto;

import br.ufba.proap.Interceptor.Domain.DataConfig;
import java.time.LocalDateTime;

public record PeriodResponseDTO(
        LocalDateTime startDate,
        LocalDateTime endDate
) {

    public PeriodResponseDTO(DataConfig data) {
        this(data.getStartDate(), data.getEndDate());
    }
}