package br.ufba.proap.sysadminpanel.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "proap_system_configuration", schema = "proap")
public class SystemConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Boolean enableSolicitation = false;

    @Column(columnDefinition = "text")
    private String qualis;

    @Column(nullable = true)
    private String sitePgcompURL;

    @Column(nullable = true)
    private String resolucaoProapURL;

    @Column(nullable = true)
    private Integer numMaxDiarias;

    @Column(nullable = true, precision = 19, scale = 4)
    private BigDecimal valorDiariaBRL;

    @Column(name = "valor_diaria_aluno_brl", nullable = true, precision = 19, scale = 4)
    private BigDecimal valorDiariaAlunoBRL;

    @Column(name = "valor_diaria_docente_brl", nullable = true, precision = 19, scale = 4)
    private BigDecimal valorDiariaDocenteBRL;

    @Column(name = "valor_diaria_docente_sp_rj_brl", nullable = true, precision = 19, scale = 4)
    private BigDecimal valorDiariaDocenteSpRjBRL;

    @Column(columnDefinition = "text", nullable = true)
    private String textoAvisoEnvioArquivoCarta;

    @Column(columnDefinition = "text", nullable = true)
    private String textoAvisoQualis;

    @Column(columnDefinition = "text", nullable = true)
    private String textoInformacaoCalcularQualis;

    @Column(columnDefinition = "text", nullable = true)
    private String textoAvisoValorInscricao;

    @Column(columnDefinition = "text", nullable = true)
    private String textoInformacaoQtdDiarias;

    @Column(columnDefinition = "text", nullable = true)
    private String textoInformacaoValorDiaria;

    @Column(columnDefinition = "text", nullable = true)
    private String textoInformacaoValorPassagem;

    @OneToMany(mappedBy = "systemConfiguration", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UrlMapper> resourceLinks;

    @OneToMany(mappedBy = "systemConfiguration", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CountryGroup> countryGroups = new ArrayList<>();

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime updatedAt;

    public List<String> getQualisList() {
        if (qualis == null || qualis.isEmpty()) {
            return new ArrayList<>();
        }
        return List.of(qualis.split(","));
    }

    public void setQualisList(List<String> qualisList) {
        if (qualisList == null || qualisList.isEmpty()) {
            this.qualis = "";
        } else {
            this.qualis = String.join(",", qualisList);
        }
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

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
        SystemConfiguration other = (SystemConfiguration) obj;
        return Objects.equals(id, other.id);
    }
}