package br.ufba.proap.solicitationadminpanel.domain.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public record AssistanceIdValueDTO(
        Long id,
        BigDecimal value,
        LocalDate createdAt,
        LocalDate dataAvaliacaoProap,
        String avaliadorProap,
        String docente
) {

    public static List<AssistanceIdValueDTO> convertPairsToDTOs(List<Object[]> data) {
        if (data == null) return List.of();

        return data.stream()
                .map(objArray -> {
                    Long id = (Long) objArray[0];
                    BigDecimal value = (BigDecimal) objArray[1];

                    LocalDate createdAt = (objArray[2] instanceof LocalDateTime)
                            ? ((LocalDateTime) objArray[2]).toLocalDate()
                            : null;

                    LocalDate dataAvaliacaoProap = (LocalDate) objArray[3];
                    String avaliadorProap = (String) objArray[4];
                    String docente = (objArray.length > 5) ? (String) objArray[5] : null;

                    return new AssistanceIdValueDTO(id, value, createdAt, dataAvaliacaoProap, avaliadorProap, docente);
                })
                .collect(Collectors.toList());
    }
}