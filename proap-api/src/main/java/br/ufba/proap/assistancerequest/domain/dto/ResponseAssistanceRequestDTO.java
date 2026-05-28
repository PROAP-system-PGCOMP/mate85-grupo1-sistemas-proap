package br.ufba.proap.assistancerequest.domain.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

import br.ufba.proap.assistancerequest.domain.AssistanceRequest;
import br.ufba.proap.authentication.domain.dto.UserResponseDTO;

public record ResponseAssistanceRequestDTO(
        Long id,
        UserResponseDTO user,
        UserResponseDTO avaliadorProap,
        UserResponseDTO avaliadorCeapg,
        String tituloPublicacao,
        List<String> coautores,
        Boolean algumCoautorPGCOMP,
        Boolean solicitanteDocente,
        String nomeDocente,
        String nomeDiscente,
        Boolean discenteNoPrazoDoCurso,
        Integer mesesAtrasoCurso,
        String nomeEvento,
        Boolean eventoInternacional,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy") LocalDate dataInicio,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy") LocalDate dataFim,
        Integer qtdDiasEvento,
        String linkHomePageEvento,
        String cidade,
        String pais,
        String qualis,
        String modalidadeParticipacao,
        BigDecimal valorInscricao,
        String linkPaginaInscricao,
        Integer quantidadeDiariasSolicitadas,
        BigDecimal valorDiaria,
        Boolean ultimaDiariaIntegral,
        Boolean isDolar,
        BigDecimal cotacaoMoeda,
        BigDecimal valorPassagem,
        BigDecimal valorTotal,
        String cartaAceite,
        String justificativa,
        Boolean aceiteFinal,
        Integer situacao,
        String comprovantePagamento,
        String numeroAta,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy") LocalDate dataAvaliacaoProap,
        Integer numeroDiariasAprovadas,
        BigDecimal valorAprovado,
        String observacao,
        String automaticDecText,
        BigDecimal custoFinalCeapg,
        String observacoesCeapg,
        BigDecimal percentualOrcamentoAnual,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm") LocalDateTime createdAt,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm") LocalDateTime updatedAt) {

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
        entity.setCartaAceite(this.cartaAceite());
        entity.setJustificativa(this.justificativa());
        entity.setAceiteFinal(this.aceiteFinal());
        entity.setSituacao(this.situacao());
        entity.setComprovantePagamento(this.comprovantePagamento());
        entity.setNumeroAta(this.numeroAta());
        entity.setDataAvaliacaoProap(this.dataAvaliacaoProap());
        entity.setNumeroDiariasAprovadas(this.numeroDiariasAprovadas());
        entity.setValorAprovado(this.valorAprovado());
        entity.setObservacao(this.observacao());
        entity.setCustoFinalCeapg(this.custoFinalCeapg());
        entity.setObservacoesCeapg(this.observacoesCeapg());
        entity.setPercentualOrcamentoAnual(this.percentualOrcamentoAnual());
        return entity;
    }

    public static ResponseAssistanceRequestDTO fromEntity(AssistanceRequest entity) {
        return new ResponseAssistanceRequestDTO(
                entity.getId(),
                UserResponseDTO.fromUser(entity.getUser()),
                entity.getAvaliadorProap() != null ? UserResponseDTO.fromUser(entity.getAvaliadorProap()) : null,
                entity.getAvaliadorCeapg() != null ? UserResponseDTO.fromUser(entity.getAvaliadorCeapg()) : null,
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
                entity.getCartaAceite(),
                entity.getJustificativa(),
                entity.getAceiteFinal(),
                entity.getSituacao(),
                entity.getComprovantePagamento(),
                entity.getNumeroAta(),
                entity.getDataAvaliacaoProap(),
                entity.getNumeroDiariasAprovadas(),
                entity.getValorAprovado(),
                entity.getObservacao(),
                entity.getAutomaticDecText(),
                entity.getCustoFinalCeapg(),
                entity.getObservacoesCeapg(),
                entity.getPercentualOrcamentoAnual(),
                entity.getCreatedAt(),
                entity.getUpdatedAt());
    }
}
