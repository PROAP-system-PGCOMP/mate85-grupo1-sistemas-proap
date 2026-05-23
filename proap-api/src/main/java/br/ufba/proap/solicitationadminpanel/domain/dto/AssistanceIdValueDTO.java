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
        String docente,
        String perfil
) {

    public static List<AssistanceIdValueDTO> convertPairsToDTOs(List<Object[]> data) {
        if (data == null) return List.of();

        return data.stream()
                .map(objArray -> {
                    Long id = (Long) objArray[0];
                    BigDecimal value = (BigDecimal) objArray[1];

                    LocalDate createdAt = (objArray[2] instanceof LocalDateTime)
                            ? ((LocalDateTime) objArray[2]).toLocalDate()
                            : (objArray[2] instanceof LocalDate ? (LocalDate) objArray[2] : null);

                    LocalDate dataAvaliacaoProap = (objArray[3] instanceof LocalDateTime)
                            ? ((LocalDateTime) objArray[3]).toLocalDate()
                            : (objArray[3] instanceof LocalDate ? (LocalDate) objArray[3] : null);

                    String avaliadorProap = (String) objArray[4];
                    String docente = (objArray.length > 5) ? (String) objArray[5] : null;
                    String perfil = (objArray.length > 6) ? (String) objArray[6] : null;

                    return new AssistanceIdValueDTO(id, value, createdAt, dataAvaliacaoProap, avaliadorProap, docente, perfil);
                })
                .collect(Collectors.toList());
    }
}
