package br.ufba.proap.assistancerequest.domain.dto;

import br.ufba.proap.assistancerequest.domain.ExtraRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record CreateExtraRequestDTO(
        @NotBlank(message = "O título é obrigatório")
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
    public ExtraRequest toEntity() {
        ExtraRequest entity = new ExtraRequest();
        entity.setTitulo(this.titulo());
        entity.setItemSolicitado(this.itemSolicitado());
        entity.setJustificativa(this.justificativa());
        entity.setValorSolicitado(this.valorSolicitado());
        entity.setSolicitacaoApoio(this.solicitacaoApoio());
        entity.setSolicitacaoAuxilioOutrasFontes(this.solicitacaoAuxilioOutrasFontes());
        entity.setNomeSolicitacao(this.nomeSolicitacao());
        entity.setNomeAgenciaFomento(this.nomeAgenciaFomento());
        entity.setValorSolicitadoAgenciaFormento(this.valorSolicitadoAgenciaFormento());

        // Regra de Negócio: Toda nova solicitação nasce em revisão (0)
        entity.setSituacao(0);

        return entity;
    }
}
