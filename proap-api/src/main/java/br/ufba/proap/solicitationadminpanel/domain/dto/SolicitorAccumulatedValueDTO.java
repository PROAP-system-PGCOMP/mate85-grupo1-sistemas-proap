package br.ufba.proap.solicitationadminpanel.domain.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

public record SolicitorAccumulatedValueDTO(String nomeDocente, BigDecimal totalAprovado) {

    public static List<SolicitorAccumulatedValueDTO> fromObjectArrayList(List<Object[]> data) {
        return data.stream()
                .map(row -> new SolicitorAccumulatedValueDTO(
                        (String) row[0],
                        (BigDecimal) row[1]))
                .collect(Collectors.toList());
    }
}
