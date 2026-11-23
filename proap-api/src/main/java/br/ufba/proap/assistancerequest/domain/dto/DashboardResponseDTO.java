package br.ufba.proap.assistancerequest.domain.dto;

import java.math.BigDecimal;

public record DashboardResponseDTO(
        Boolean solicitanteDocente,
        Boolean eventoInternacional,
        BigDecimal totalSolicitado,
        BigDecimal totalAprovado,
        long count,
        long qtdInscricoes,
        long qtdPassagensAprovadas,
        BigDecimal totalDiariasAprovadas
) {
}
