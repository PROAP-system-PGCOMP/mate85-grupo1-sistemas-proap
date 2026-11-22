package br.ufba.proap.sysadminpanel.domain.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import br.ufba.proap.sysadminpanel.domain.CountryGroup;
import br.ufba.proap.sysadminpanel.domain.SystemConfiguration;
import br.ufba.proap.sysadminpanel.domain.UrlMapper;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfigurationDTO {

    private Long id;
    private Boolean enableSolicitation;
    private List<String> qualis;
    private String sitePgcompURL;
    private String resolucaoProapURL;
    private Integer numMaxDiarias;
    private BigDecimal valorDiariaBRL;
    private BigDecimal valorDiariaAlunoBRL;
    private BigDecimal valorDiariaDocenteBRL;
    private BigDecimal valorDiariaDocenteSpRjBRL;
    private String textoAvisoQualis;
    private String textoAvisoValorInscricao;
    private String textoInformacaoQtdDiarias;
    private String textoAvisoEnvioArquivoCarta;
    private String textoInformacaoCalcularQualis;
    private String textoInformacaoValorDiaria;
    private String textoInformacaoValorPassagem;
    private List<UrlMapperDTO> resourceLinks;
    private List<CountryGroupDTO> countryGroups;

    public static SystemConfigurationDTO fromEntity(SystemConfiguration config) {
        if (config == null) {
            return null;
        }

        List<UrlMapperDTO> resourceLinksDTO = new ArrayList<>();
        if (config.getResourceLinks() != null) {
            for (UrlMapper urlMapper : config.getResourceLinks()) {
                resourceLinksDTO.add(new UrlMapperDTO(
                        urlMapper.getId(),
                        urlMapper.getUrl(),
                        urlMapper.getFieldName(),
                        urlMapper.getUrlTitle()));
            }
        }

        List<CountryGroupDTO> countryGroupDTOs = new ArrayList<>();
        if (config.getCountryGroups() != null) {
            for (CountryGroup countryGroup : config.getCountryGroups()) {
                countryGroupDTOs.add(new CountryGroupDTO(
                        countryGroup.getId(),
                        countryGroup.getGroupName(),
                        countryGroup.getValueUSD(),
                        countryGroup.getCountriesList()));
            }
        }

        SystemConfigurationDTO dto = new SystemConfigurationDTO(
                config.getId(),
                config.getEnableSolicitation(),
                config.getQualisList(),
                config.getSitePgcompURL(),
                config.getResolucaoProapURL(),
                config.getNumMaxDiarias(),
                config.getValorDiariaBRL(),
                config.getValorDiariaAlunoBRL(),
                config.getValorDiariaDocenteBRL(),
                config.getValorDiariaDocenteSpRjBRL(),
                config.getTextoAvisoQualis(),
                config.getTextoAvisoValorInscricao(),
                config.getTextoInformacaoQtdDiarias(),
                config.getTextoAvisoEnvioArquivoCarta(),
                config.getTextoInformacaoCalcularQualis(),
                config.getTextoInformacaoValorDiaria(),
                config.getTextoInformacaoValorPassagem(),
                resourceLinksDTO,
                countryGroupDTOs);

        return dto;
    }

    public SystemConfiguration toEntity() {
        SystemConfiguration config = new SystemConfiguration();
        config.setId(this.id);
        config.setEnableSolicitation(this.enableSolicitation);
        config.setQualisList(this.qualis);
        config.setSitePgcompURL(this.sitePgcompURL);
        config.setResolucaoProapURL(this.resolucaoProapURL);
        config.setNumMaxDiarias(this.numMaxDiarias);
        config.setValorDiariaBRL(this.valorDiariaBRL);
        config.setValorDiariaAlunoBRL(this.valorDiariaAlunoBRL);
        config.setValorDiariaDocenteBRL(this.valorDiariaDocenteBRL);
        config.setValorDiariaDocenteSpRjBRL(this.valorDiariaDocenteSpRjBRL);
        config.setTextoAvisoQualis(this.textoAvisoQualis);
        config.setTextoAvisoValorInscricao(this.textoAvisoValorInscricao);
        config.setTextoInformacaoQtdDiarias(this.textoInformacaoQtdDiarias);
        config.setTextoAvisoEnvioArquivoCarta(this.textoAvisoEnvioArquivoCarta);
        config.setTextoInformacaoCalcularQualis(this.textoInformacaoCalcularQualis);
        config.setTextoInformacaoValorDiaria(this.textoInformacaoValorDiaria);
        config.setTextoInformacaoValorPassagem(this.textoInformacaoValorPassagem);
        if (this.resourceLinks != null) {
            List<UrlMapper> urlMappers = new ArrayList<>();
            for (UrlMapperDTO dto : this.resourceLinks) {
                UrlMapper urlMapper = new UrlMapper();
                urlMapper.setId(dto.getId());
                urlMapper.setUrl(dto.getUrl());
                urlMapper.setFieldName(dto.getFieldName());
                urlMapper.setUrlTitle(dto.getUrlTitle());
                urlMapper.setSystemConfiguration(config);
                urlMappers.add(urlMapper);
            }
            config.setResourceLinks(urlMappers);
        }

        if (this.countryGroups != null) {
            List<CountryGroup> countryGroups = new ArrayList<>();
            for (CountryGroupDTO dto : this.countryGroups) {
                CountryGroup countryGroup = new CountryGroup();
                countryGroup.setId(dto.getId());
                countryGroup.setGroupName(dto.getGroupName());
                countryGroup.setValueUSD(dto.getValueUSD());
                countryGroup.setCountriesList(dto.getCountries());
                countryGroup.setSystemConfiguration(config);
                countryGroups.add(countryGroup);
            }
            config.setCountryGroups(countryGroups);
        }

        return config;
    }
}