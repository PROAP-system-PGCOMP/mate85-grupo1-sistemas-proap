package br.ufba.proap.assistancerequest.domain.dto;

import br.ufba.proap.authentication.domain.Perfil;

import java.math.BigDecimal;

public record DashboardResponseDTO (
        Perfil perfil,
        Boolean eventoInternacional,
        BigDecimal totalSolicitado,
        BigDecimal totalAprovado
){
}
