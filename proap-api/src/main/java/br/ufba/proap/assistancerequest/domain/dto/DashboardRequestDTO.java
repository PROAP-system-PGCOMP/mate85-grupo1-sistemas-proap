package br.ufba.proap.assistancerequest.domain.dto;

import java.time.LocalDateTime;
import java.util.List;

public record DashboardRequestDTO(
        LocalDateTime startDate,
        LocalDateTime endDate,
        Boolean eventoInternacional,
        List<Long> perfilId
) {
}
