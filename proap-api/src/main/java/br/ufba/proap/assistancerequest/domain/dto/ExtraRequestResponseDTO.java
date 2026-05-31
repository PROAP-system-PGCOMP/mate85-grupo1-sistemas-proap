package br.ufba.proap.assistancerequest.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ExtraRequestResponseDTO(
        Long id,

        @NotBlank
        String titulo,

        @NotBlank(message = "O item solicitado é obrigatório")
        String itemSolicitado,

        @NotBlank(message = "A justificativa é obrigatória")
        String justificativa,

        @NotNull(message = "O valor solicitado deve ser informado")
        @Positive(message = "O valor deve ser maior que zero")
        BigDecimal valorSolicitado,

        @NotNull(message = "Informe se há solicitação de apoio")
        Boolean solicitacaoApoio,

        @NotNull(message = "Informe se há auxílio de outras fontes")
        Boolean solicitacaoAuxilioOutrasFontes,

        String nomeSolicitacao,
        String nomeAgenciaFomento,
        String valorSolicitadoAgenciaFormento
) {
}


