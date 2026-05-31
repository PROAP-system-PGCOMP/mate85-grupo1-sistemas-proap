package br.ufba.proap.assistancerequest.domain.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

import br.ufba.proap.assistancerequest.domain.AssistanceRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateAssistanceRequestDTO(
        @NotBlank String tituloPublicacao,
        List<String> coautores,
        Boolean algumCoautorPGCOMP,
        Boolean solicitanteDocente,
        @NotBlank String nomeDocente,
        @NotBlank String nomeDiscente,
        Boolean discenteNoPrazoDoCurso,
        Integer mesesAtrasoCurso,
        @NotBlank String nomeEvento,
        @NotNull Boolean eventoInternacional,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy") LocalDate dataInicio,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy") LocalDate dataFim,
        @NotNull @Positive Integer qtdDiasEvento,
        @NotBlank String linkHomePageEvento,
        @NotBlank String cidade,
        @NotBlank String pais,
        @NotBlank String qualis,
        @NotBlank String modalidadeParticipacao,
        @NotNull @Positive BigDecimal valorInscricao,
        @NotBlank String linkPaginaInscricao,
        @NotNull @Positive Integer quantidadeDiariasSolicitadas,
        @NotNull @Positive BigDecimal valorDiaria,
        @NotNull Boolean ultimaDiariaIntegral,
        Boolean isDolar,
        BigDecimal cotacaoMoeda,
        BigDecimal valorPassagem,
        BigDecimal valorTotal,
        @NotBlank String justificativa,
        String cartaAceite) {

    public static CreateAssistanceRequestDTO fromEntity(AssistanceRequest entity) {
        return new CreateAssistanceRequestDTO(
                entity.getTituloPublicacao(),
                entity.getCoautores(),
                entity.getAlgumCoautorPGCOMP(),
                entity.getSolicitanteDocente(),
                entity.getNomeDocente(),
                entity.getNomeDiscente(),
                entity.getDiscenteNoPrazoDoCurso(),
                entity.getMesesAtrasoCurso(),
                entity.getNomeEvento(),
                entity.getEventoInternacional(),
                entity.getDataInicio(),
                entity.getDataFim(),
                entity.getQtdDiasEvento(),
                entity.getLinkHomePageEvento(),
                entity.getCidade(),
                entity.getPais(),
                entity.getQualis(),
                entity.getModalidadeParticipacao(),
                entity.getValorInscricao(),
                entity.getLinkPaginaInscricao(),
                entity.getQuantidadeDiariasSolicitadas(),
                entity.getValorDiaria(),
                entity.getUltimaDiariaIntegral(),
                entity.getIsDolar(),
                entity.getCotacaoMoeda(),
                entity.getValorPassagem(),
                entity.getValorTotal(),
                entity.getJustificativa(),
                entity.getCartaAceite());
    }

    public AssistanceRequest toEntity() {
        AssistanceRequest entity = new AssistanceRequest();
        entity.setTituloPublicacao(this.tituloPublicacao());
        entity.setCoautores(this.coautores());
        entity.setAlgumCoautorPGCOMP(this.algumCoautorPGCOMP());
        entity.setSolicitanteDocente(this.solicitanteDocente());
        entity.setNomeDocente(this.nomeDocente());
        entity.setNomeDiscente(this.nomeDiscente());
        entity.setDiscenteNoPrazoDoCurso(this.discenteNoPrazoDoCurso());
        entity.setMesesAtrasoCurso(this.mesesAtrasoCurso());
        entity.setNomeEvento(this.nomeEvento());
        entity.setEventoInternacional(this.eventoInternacional());
        entity.setDataInicio(this.dataInicio());
        entity.setDataFim(this.dataFim());
        entity.setQtdDiasEvento(this.qtdDiasEvento());
        entity.setLinkHomePageEvento(this.linkHomePageEvento());
        entity.setCidade(this.cidade());
        entity.setPais(this.pais());
        entity.setQualis(this.qualis());
        entity.setModalidadeParticipacao(this.modalidadeParticipacao());
        entity.setValorInscricao(this.valorInscricao());
        entity.setLinkPaginaInscricao(this.linkPaginaInscricao());
        entity.setQuantidadeDiariasSolicitadas(this.quantidadeDiariasSolicitadas());
        entity.setValorDiaria(this.valorDiaria());
        entity.setUltimaDiariaIntegral(this.ultimaDiariaIntegral());
        entity.setIsDolar(this.isDolar());
        entity.setCotacaoMoeda(this.cotacaoMoeda());
        entity.setValorPassagem(this.valorPassagem());
        entity.setValorTotal(this.valorTotal());
        entity.setJustificativa(this.justificativa());
        if (this.cartaAceite() != null) {
            entity.setCartaAceite(this.cartaAceite());
        }
        return entity;
    }
}
