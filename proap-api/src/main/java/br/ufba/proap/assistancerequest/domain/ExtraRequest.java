package br.ufba.proap.assistancerequest.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import com.fasterxml.jackson.annotation.JsonFormat;

import br.ufba.proap.authentication.domain.User;

@Entity
@Table(name = "proap_extra_request", schema = "proap")
public class ExtraRequest {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// Dados do solicitante
	@ManyToOne
	private User user;

	@Column(nullable = false, columnDefinition = "VARCHAR(255) DEFAULT 'Sem título'")
	private String titulo;

	private String itemSolicitado;

	@Column(columnDefinition = "text")
	private String justificativa;

	@Column(nullable = true, precision = 19, scale = 4)
	private BigDecimal valorSolicitado;

	private Boolean solicitacaoApoio;
	private Boolean solicitacaoAuxilioOutrasFontes;

	private String nomeSolicitacao;

	@Column(nullable = true)
	private String nomeAgenciaFomento;

	@Column(nullable = true)
	private String valorSolicitadoAgenciaFormento;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
	private LocalDateTime createdAt;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm")
	private LocalDateTime updatedAt;

	// 0 - Em revisao, 1 - Aceita, 2 - Nao Aceita
	@Column(nullable = false)
	private int situacao;

	@Column(nullable = true)
	private String numeroAta;

	@Column(nullable = true)
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
	private LocalDate dataAvaliacaoProap;

	@Column(nullable = true, precision = 19, scale = 4)
	private BigDecimal valorAprovado;

	@Column(nullable = true)
	private String observacao;

	// Apos aceite
	@Column(nullable = true, columnDefinition = "text")
	private String automaticDecText;

	public String getItemSolicitado() {
		return itemSolicitado;
	}

	public void setItemSolicitado(String itemSolicitado) {
		this.itemSolicitado = itemSolicitado;
	}

	public String getNomeSolicitacao() {
		return nomeSolicitacao;
	}

	public void setNomeSolicitacao(String nomeSolicitacao) {
		this.nomeSolicitacao = nomeSolicitacao;
	}

	public String getNomeAgenciaFomento() {
		return nomeAgenciaFomento;
	}

	public void setNomeAgenciaFomento(String nomeAgenciaFomento) {
		this.nomeAgenciaFomento = nomeAgenciaFomento;
	}

	public String getValorSolicitadoAgenciaFormento() {
		return valorSolicitadoAgenciaFormento;
	}

	public void setValorSolicitadoAgenciaFormento(String valorSolicitadoAgenciaFormento) {
		this.valorSolicitadoAgenciaFormento = valorSolicitadoAgenciaFormento;
	}

	public int getSituacao() {
		return situacao;
	}

	public void setSituacao(int situacao) {
		this.situacao = situacao;
	}

	public String getNumeroAta() {
		return numeroAta;
	}

	public void setNumeroAta(String numeroAta) {
		this.numeroAta = numeroAta;
	}

	public LocalDate getDataAvaliacaoProap() {
		return dataAvaliacaoProap;
	}

	public void setDataAvaliacaoProap(LocalDate dataAvaliacaoProap) {
		this.dataAvaliacaoProap = dataAvaliacaoProap;
	}

	public BigDecimal getValorAprovado() {
		return valorAprovado;
	}

	public void setValorAprovado(BigDecimal valorAprovado) {
		this.valorAprovado = valorAprovado;
	}

	public String getObservacao() {
		return observacao;
	}

	public void setObservacao(String observacao) {
		this.observacao = observacao;
	}

    public String getAutomaticDecText() {
        if (this.user == null || this.valorSolicitado == null) {
            return "Dados insuficientes para gerar a decisão automática.";
        }

        String name = this.user.getName();
        String valorStr = this.valorSolicitado.toString();
        String item = this.itemSolicitado != null ? this.itemSolicitado : "item não especificado";
        String justif = this.justificativa != null ? this.justificativa : "sem justificativa";

        String funcao = (this.user.getPerfil() != null) ? this.user.getPerfil().getName() : "Usuário";

        if (this.situacao == 1) {
            return "O " + funcao + " - " + name + " solicita apoio para compra de " + item
                    + " com valor de R$" + valorStr + " com a justificativa, " + justif + ". " +
                    "Após verificação da documentação enviada pelo discente, a comissão Proap entende que a solicitação está de acordo com a resolução PROAP vigente e recomenda sua aprovação.";
        } else {
            return "O " + funcao + " - " + name + " solicita apoio para compra de " + item
                    + " com valor de R$" + valorStr + " com a justificativa, " + justif + ". " +
                    "Após verificação da documentação enviada pelo discente, a comissão Proap entende que a solicitação não está de acordo com a resolução PROAP vigente e recomenda sua reprovação.";
        }
    }

    public void setAutomaticDecText(String automaticDecText) {
        this.automaticDecText = automaticDecText;
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public User getUser() {
		return this.user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public Boolean getSolicitacaoApoio() {
		return solicitacaoApoio;
	}

	public void setSolicitacaoApoio(Boolean solicitacaoApoio) {
		this.solicitacaoApoio = solicitacaoApoio;
	}

	public BigDecimal getValorSolicitado() {
		return valorSolicitado;
	}

	public void setValorSolicitado(BigDecimal valorSolicitado) {
		this.valorSolicitado = valorSolicitado;
	}

	public Boolean getSolicitacaoAuxilioOutrasFontes() {
		return solicitacaoAuxilioOutrasFontes;
	}

	public void setSolicitacaoAuxilioOutrasFontes(Boolean solicitacaoAuxilioOutrasFontes) {
		this.solicitacaoAuxilioOutrasFontes = solicitacaoAuxilioOutrasFontes;
	}

	public String getJustificativa() {
		return justificativa;
	}

	public void setJustificativa(String justificativa) {
		this.justificativa = justificativa;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	@PrePersist
	public void prePersist() {
		setCreatedAt(LocalDateTime.now());
	}

	@PreUpdate
	public void preUpdate() {
		setUpdatedAt(LocalDateTime.now());
	}

	public String getTitulo() {
		return titulo;
	}

	public void setTitulo(String titulo) {
		this.titulo = titulo;
	}
}
