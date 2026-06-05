package br.ufba.proap.assistancerequest.domain.dto;

import br.ufba.proap.assistancerequest.domain.ExtraRequest;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ExtraRequestResponseDTO(
        Long id,

        @NotBlank
        String userName,

        @NotBlank
        String userEmail,

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
        String valorSolicitadoAgenciaFormento,

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
        LocalDateTime createdAt,
        int situacao,
        String numeroAta,

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
        LocalDate dataAvaliacaoProap,
        BigDecimal valorAprovado,
        String observacao,
        String automaticDecText
) {
    public ExtraRequestResponseDTO(ExtraRequest extra) {
        this(
                extra.getId(),
                extra.getUser() != null ? extra.getUser().getName() : "Usuário",
                extra.getUser() != null ? extra.getUser().getEmail() : "",
                extra.getTitulo(),
                extra.getItemSolicitado(),
                extra.getJustificativa(),
                extra.getValorSolicitado(),
                extra.getSolicitacaoApoio(),
                extra.getSolicitacaoAuxilioOutrasFontes(),
                extra.getNomeSolicitacao(),
                extra.getNomeAgenciaFomento(),
                extra.getValorSolicitadoAgenciaFormento(),
                extra.getCreatedAt() != null ? extra.getCreatedAt() : LocalDateTime.now(),
                extra.getSituacao(),
                extra.getNumeroAta(),
                extra.getDataAvaliacaoProap(),
                extra.getValorAprovado(),
                extra.getObservacao(),
                extra.getAutomaticDecText()
        );
    }
}


