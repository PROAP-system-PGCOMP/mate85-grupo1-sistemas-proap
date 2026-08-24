package br.ufba.proap.assistancerequest.domain.dto;

import java.time.LocalDateTime;

public record CountRequestDTO(
        LocalDateTime startDate,
        LocalDateTime endDate
) {
}
