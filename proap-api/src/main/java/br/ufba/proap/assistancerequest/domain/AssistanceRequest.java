package br.ufba.proap.assistancerequest.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonFormat;

import br.ufba.proap.authentication.domain.User;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "proap_assistancerequest", schema = "proap")
public class AssistanceRequest {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// Avaliadores

	@ManyToOne
	private User avaliadorProap;

	@ManyToOne
	private User avaliadorCeapg;

	// Dados da Solicitação
	@ManyToOne
	private User user;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String tituloPublicacao;

	private String coautores;

	@Column(nullable = false)
	private Boolean algumCoautorPGCOMP;

	// Detalhes do Solicitante
	@Column(nullable = false)
	private Boolean solicitanteDocente;

	@Column(nullable = false)
	private String nomeDocente;

	private String nomeDiscente;

	@Column(nullable = true)
	private Boolean discenteNoPrazoDoCurso;

	@Column(nullable = true, name = "meses_atraso")
	private Integer mesesAtrasoCurso;

	// Detalhamento do Evento (ou Solicitação)

	@Column(nullable = false)
	private String nomeEvento;

	@Column(nullable = false)
	private Boolean eventoInternacional;

	@Column(nullable = false)
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
	private LocalDate dataInicio;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
	private LocalDate dataFim;

	private Integer qtdDiasEvento;

	private String linkHomePageEvento;

	@Column(nullable = false)
	private String cidade;

	@Column(nullable = false)
	private String pais;

	private String qualis;

	@Column(nullable = false)
	private String modalidadeParticipacao;

	// Detalhamento Financeiro

	@Column(nullable = true, precision = 19, scale = 4)
	private BigDecimal valorInscricao;

	private String linkPaginaInscricao;

	private Integer quantidadeDiariasSolicitadas;

	@Column(nullable = true, precision = 19, scale = 4)
	private BigDecimal valorDiaria;

	@Column(nullable = false, columnDefinition = "boolean default false")
	private Boolean ultimaDiariaIntegral;

	private Boolean isDolar;

	@Column(nullable = true, precision = 19, scale = 4)
	private BigDecimal cotacaoMoeda;

	@Column(nullable = true, precision = 19, scale = 4)
	private BigDecimal valorPassagem;

	@Column(nullable = true, precision = 19, scale = 4)
	private BigDecimal valorTotal;
	// Aceite e Justificativa

	@Column(nullable = true)
	private String cartaAceite;

	private String justificativa;

	private Boolean aceiteFinal;

	// Dados sobre a revisão

	// 0 - Em revisao, 1 - Aceita, 2 - Nao Aceita
	@Column(nullable = false)
	private Integer situacao;

	@Column(nullable = true)
	private String comprovantePagamento;

	@Column(nullable = true)
	private String numeroAta;

	@Column(nullable = true)
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
	private LocalDate dataAvaliacaoProap;

	@Column(nullable = true)
	private Integer numeroDiariasAprovadas;

	@Column(nullable = true, precision = 19, scale = 4)
	private BigDecimal valorAprovado;

	@Column(nullable = true)
	private String observacao;

	@Column(nullable = true, precision = 5, scale = 2)
	private BigDecimal percentualOrcamentoAnual;

	// Campos CEAPG

	@Column(nullable = true, precision = 19, scale = 4)
	private BigDecimal custoFinalCeapg;

	@Column(nullable = true, columnDefinition = "TEXT")
	private String observacoesCeapg;

	@Column(nullable = true)
	private LocalDate dataAvaliacaoCeapg;

	// Apos aceite
	@Column(nullable = true, columnDefinition = "text", length = 100000)
	private String automaticDecText;

	public List<String> getCoautores() {
		return coautores != null ? List.of(coautores.split(",")) : List.of();
	}

	public void setCoautores(List<String> coautores) {
		this.coautores = coautores != null ? String.join(",", coautores) : null;
	}

	public void setAutomaticDecText() {
		String name = this.user.getName();
		String quantDiarias = String.valueOf(this.quantidadeDiariasSolicitadas);
		String valorTotal = this.valorTotal.toString();
		String cargo = this.solicitanteDocente ? "docente" : "discente";
		String nomeTrabalho = this.tituloPublicacao;
		String evento = this.nomeEvento;
		String qualis = this.qualis;
		String cidade = this.cidade;
		String pais = this.pais;
		String inicio = this.dataInicio.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));
		String fim = this.dataFim.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));
		String cotacao = this.cotacaoMoeda.toString();

		switch (this.situacao) {
			case 1: // Aprovado
				if (!this.isDolar) {
					this.automaticDecText = "O " + cargo + " " + name + " solicita apoio no valor total de (R$"
							+ valorTotal
							+ " e " + quantDiarias + " diárias ) para apresentação do trabalho (" + nomeTrabalho
							+ ") no evento " + evento + ", Qualis " + qualis + ", a ser realizado em " + cidade + "-"
							+ pais
							+ ", no período de " + inicio + " a " + fim
							+ ". Após verificação da documentação enviada, a comissão PROAP entende que a solicitação está de acordo com a resolução vigente e recomenda sua aprovação.";
				} else {
					this.automaticDecText = "O " + cargo + " " + name + " solicita apoio no valor total em dólar de ($"
							+ valorTotal + " e " + quantDiarias
							+ " diárias ) com variação cambial atual informada de (R$ "
							+ cotacao + ") para apresentação do trabalho (" + nomeTrabalho + ") no evento "
							+ evento + ", Qualis " + qualis + ", a ser realizado em " + cidade + "-" + pais
							+ ", no período de " + inicio + " a " + fim
							+ ". Após verificação da documentação enviada, a comissão PROAP entende que a solicitação está de acordo com a resolução vigente e recomenda sua aprovação.";
				}
				break;

			case 2: // Rejeitado
				if (!this.isDolar) {
					this.automaticDecText = "O " + cargo + " " + name + " solicita apoio no valor total de (R$"
							+ valorTotal + " e " + quantDiarias + " diárias ) para apresentação do trabalho ("
							+ nomeTrabalho
							+ ") no evento " + evento + ", Qualis " + qualis + ", a ser realizado em " + cidade + "-"
							+ pais
							+ ", no período de " + inicio + " a " + fim
							+ ". Após verificação da documentação enviada, a comissão PROAP entende que a solicitação não está de acordo com a resolução vigente e recomenda sua reprovação.";
				} else {
					this.automaticDecText = "O " + cargo + " " + name + " solicita apoio no valor total em dólar de ($"
							+ valorTotal + " e " + quantDiarias
							+ " diárias ) com variação cambial atual informada de (R$ "
							+ cotacao + ") para apresentação do trabalho (" + nomeTrabalho + ") no evento "
							+ evento + ", Qualis " + qualis + ", a ser realizado em " + cidade + "-" + pais
							+ ", no período de " + inicio + " a " + fim
							+ ". Após verificação da documentação enviada, a comissão PROAP entende que a solicitação não está de acordo com a resolução vigente e recomenda sua reprovação.";
				}
				break;

			case 3: // Aguardando informações
				this.automaticDecText = "O " + cargo + " " + name + " solicitou apoio para apresentação do trabalho ("
						+ nomeTrabalho + ") no evento " + evento + ", Qualis " + qualis + ", a ser realizado em "
						+ cidade
						+ "-" + pais + ", no período de " + inicio + " a " + fim
						+ ". A solicitação está aguardando informações adicionais do solicitante para ser avaliada.";
				break;
			default:
				this.automaticDecText = null;
				break;
		}
	}

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
	private LocalDateTime createdAt;

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
	private LocalDateTime updatedAt;

	@Override
	public int hashCode() {
		return Objects.hash(id);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		AssistanceRequest other = (AssistanceRequest) obj;
		return Objects.equals(id, other.id);
	}

	@PrePersist
	public void prePersist() {
		setCreatedAt(LocalDateTime.now());
	}

	@PreUpdate
	public void preUpdate() {
		setUpdatedAt(LocalDateTime.now());
	}

}
