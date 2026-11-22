package br.ufba.proap.sysadminpanel.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.ufba.proap.sysadminpanel.domain.CountryGroup;
import br.ufba.proap.sysadminpanel.domain.SystemConfiguration;
import br.ufba.proap.sysadminpanel.domain.UrlMapper;
import br.ufba.proap.sysadminpanel.domain.dto.CountryGroupDTO;
import br.ufba.proap.sysadminpanel.domain.dto.SystemConfigurationDTO;
import br.ufba.proap.sysadminpanel.domain.dto.UrlMapperDTO;
import br.ufba.proap.sysadminpanel.repository.SystemConfigurationRepository;
import br.ufba.proap.util.TextNormalizer;

@Service
public class SystemConfigurationService {

    @Autowired
    private SystemConfigurationRepository repository;

    /**
     * Busca a configuração atual do sistema. Se não existir, cria uma com valores
     * padrão.
     */
    @Transactional
    public SystemConfigurationDTO getCurrentConfiguration() {
        List<SystemConfiguration> configs = repository.findAll();

        if (configs.isEmpty()) {
            return SystemConfigurationDTO.fromEntity(createDefaultConfiguration());
        }

        return SystemConfigurationDTO.fromEntity(configs.get(0));
    }

    /**
     * Atualiza a configuração do sistema
     */
    @Transactional
    public SystemConfigurationDTO updateConfiguration(SystemConfigurationDTO dto) {
        List<SystemConfiguration> configs = repository.findAll();

        SystemConfiguration config;
        if (configs.isEmpty()) {
            config = new SystemConfiguration();
            config.setResourceLinks(new ArrayList<>());
        } else {
            config = configs.get(0);
            // Inicializa a lista se for nula
            if (config.getResourceLinks() == null) {
                config.setResourceLinks(new ArrayList<>());
            }
        }

        // Atualiza apenas os campos não nulos
        if (dto.getQualis() != null) {
            config.setQualisList(dto.getQualis());
        }

        if (dto.getEnableSolicitation() != null) {
            config.setEnableSolicitation(dto.getEnableSolicitation());
        }

        if (dto.getSitePgcompURL() != null) {
            config.setSitePgcompURL(dto.getSitePgcompURL());
        }

        if (dto.getResolucaoProapURL() != null) {
            config.setResolucaoProapURL(dto.getResolucaoProapURL());
        }

        if (dto.getNumMaxDiarias() != null) {
            config.setNumMaxDiarias(dto.getNumMaxDiarias());
        }

        if (dto.getValorDiariaBRL() != null) {
            config.setValorDiariaBRL(dto.getValorDiariaBRL());
        }

        if (dto.getValorDiariaAlunoBRL() != null) {
            config.setValorDiariaAlunoBRL(dto.getValorDiariaAlunoBRL());
        }

        if (dto.getValorDiariaDocenteBRL() != null) {
            config.setValorDiariaDocenteBRL(dto.getValorDiariaDocenteBRL());
        }

        if (dto.getValorDiariaDocenteSpRjBRL() != null) {
            config.setValorDiariaDocenteSpRjBRL(dto.getValorDiariaDocenteSpRjBRL());
        }

        if (dto.getTextoAvisoQualis() != null) {
            config.setTextoAvisoQualis(dto.getTextoAvisoQualis());
        }

        if (dto.getTextoAvisoValorInscricao() != null) {
            config.setTextoAvisoValorInscricao(dto.getTextoAvisoValorInscricao());
        }

        if (dto.getTextoInformacaoQtdDiarias() != null) {
            config.setTextoInformacaoQtdDiarias(dto.getTextoInformacaoQtdDiarias());
        }

        if (dto.getTextoAvisoEnvioArquivoCarta() != null) {
            config.setTextoAvisoEnvioArquivoCarta(dto.getTextoAvisoEnvioArquivoCarta());
        }

        if (dto.getTextoInformacaoCalcularQualis() != null) {
            config.setTextoInformacaoCalcularQualis(dto.getTextoInformacaoCalcularQualis());
        }

        if (dto.getTextoInformacaoValorDiaria() != null) {
            config.setTextoInformacaoValorDiaria(dto.getTextoInformacaoValorDiaria());
        }

        if (dto.getTextoInformacaoValorPassagem() != null) {
            config.setTextoInformacaoValorPassagem(dto.getTextoInformacaoValorPassagem());
        }

        if (dto.getResourceLinks() != null) {

            config.getResourceLinks().clear();

            for (UrlMapperDTO urlDto : dto.getResourceLinks()) {
                UrlMapper url = new UrlMapper();
                if (urlDto.getId() != null) {
                    url.setId(urlDto.getId());
                }
                url.setUrl(urlDto.getUrl());
                url.setFieldName(urlDto.getFieldName());
                url.setUrlTitle(urlDto.getUrlTitle());
                url.setSystemConfiguration(config);
                config.getResourceLinks().add(url);
            }
        }

        if (dto.getCountryGroups() != null) {
            validateNoDuplicateCountries(dto.getCountryGroups());
            config.getCountryGroups().clear();

            for (CountryGroupDTO groupDTO : dto.getCountryGroups()) {
                CountryGroup group = new CountryGroup();
                group.setGroupName(groupDTO.getGroupName());
                group.setValueUSD(groupDTO.getValueUSD());
                group.setCountriesList(groupDTO.getCountries());
                group.setSystemConfiguration(config);
                config.getCountryGroups().add(group);
            }
        }

        config = repository.save(config);
        return SystemConfigurationDTO.fromEntity(config);
    }

    /**
     * Atualiza apenas a lista de Qualis
     */
    @Transactional
    public List<String> updateQualisList(List<String> qualisList) {
        SystemConfigurationDTO config = getCurrentConfiguration();
        config.setQualis(qualisList);
        SystemConfigurationDTO updated = updateConfiguration(config);
        return updated.getQualis();
    }

    /**
     * Atualiza os links de recursos
     */
    @Transactional
    public List<UrlMapperDTO> updateResourceLinks(List<UrlMapperDTO> resourceLinks) {
        SystemConfigurationDTO config = getCurrentConfiguration();
        config.setResourceLinks(resourceLinks);
        SystemConfigurationDTO updated = updateConfiguration(config);
        return updated.getResourceLinks();
    }

    /**
     * Garante que nenhum país apareça em mais de um grupo. A comparação ignora
     * caixa, acentos e espaços nas pontas.
     *
     * @throws IllegalArgumentException listando os países em conflito
     */
    static void validateNoDuplicateCountries(List<CountryGroupDTO> groups) {
        Map<String, String> firstGroupByCountry = new HashMap<>();
        Map<String, String> firstNameByCountry = new HashMap<>();
        Map<String, Set<String>> conflicts = new LinkedHashMap<>();

        for (CountryGroupDTO group : groups) {
            if (group.getCountries() == null) {
                continue;
            }
            Set<String> seenInThisGroup = new HashSet<>();
            for (String country : group.getCountries()) {
                if (country == null || country.isBlank()) {
                    continue;
                }
                String key = TextNormalizer.normalize(country);
                if (!seenInThisGroup.add(key)) {
                    continue; // repetido dentro do mesmo grupo é inofensivo
                }
                firstNameByCountry.putIfAbsent(key, country.trim());
                String previousGroup = firstGroupByCountry.putIfAbsent(key, group.getGroupName());
                if (previousGroup != null) {
                    conflicts.computeIfAbsent(firstNameByCountry.get(key),
                            c -> new LinkedHashSet<>(List.of(previousGroup)))
                            .add(group.getGroupName());
                }
            }
        }

        if (!conflicts.isEmpty()) {
            String detail = conflicts.entrySet().stream()
                    .map(e -> e.getKey() + " (grupos " + String.join(", ", e.getValue()) + ")")
                    .collect(Collectors.joining("; "));
            throw new IllegalArgumentException(
                    "Cada país deve pertencer a um único grupo. Países em mais de um grupo: " + detail);
        }
    }

    /**
     * Cria uma configuração padrão
     */
    private SystemConfiguration createDefaultConfiguration() {
        SystemConfiguration config = new SystemConfiguration();
        config.setEnableSolicitation(false);
        config.setQualisList(List.of("A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4"));
        config.setNumMaxDiarias(5);
        config.setValorDiariaBRL(BigDecimal.valueOf(320.0));
        config.setValorDiariaAlunoBRL(BigDecimal.valueOf(320.0));
        config.setValorDiariaDocenteBRL(BigDecimal.valueOf(380.0));
        config.setValorDiariaDocenteSpRjBRL(BigDecimal.valueOf(425.0));
        config.setTextoAvisoQualis(
                "Nos casos de artigos aceitos em conferências, o Qualis deve ser atribubído quando o artigo é aceito no evento principal, e não em eventos satélites como workshops, minicursos ou CTDs.");
        config.setTextoAvisoValorInscricao(
                "O PROAP não reembolsa taxa de filiação, a não ser que seja uma opção obrigatória associada à taxa de inscrição.");
        config.setTextoInformacaoQtdDiarias(
                "Conforme a resolução do PROAP, a quantidade de diárias é limitada ao número de dias do evento, e a última diária pode ser 50% do valor. Leia a resolução antes de finalizar.");
        config.setTextoAvisoEnvioArquivoCarta("É obrigatória a carta de aceite para apoio a publicação científica.");
        config.setTextoInformacaoCalcularQualis(
                "Para calcular o Qualis do seu evento, siga as instruções disponíveis no site da PGCOMP.");
        config.setTextoInformacaoValorDiaria(
                "No Brasil, a diária é de R$320 para discentes e R$380 para docentes (R$425 para docentes nas capitais de São Paulo e Rio de Janeiro). No exterior, o valor em USD segue o grupo do país, conforme a tabela de auxílio diário no exterior mais recente.");
        config.setTextoInformacaoValorPassagem(
                "As passagens serão adquiridas pelo SCDP.");
        config.setResourceLinks(new ArrayList<>());

        List<CountryGroup> countryGroups = new ArrayList<>();

        CountryGroup groupA = new CountryGroup();
        groupA.setGroupName("A");
        groupA.setValueUSD(BigDecimal.valueOf(180.0));
        groupA.setCountriesList(List.of("Afeganistão", "Armênia", "Bangladesh", "Belarus", "Benin", "Bolívia",
                "Burkina Faso", "Butão", "Chile", "Comores", "República Popular Democrática da Coréia", "Costa Rica",
                "El Salvador", "Equador", "Eslovênia", "Filipinas", "Gâmbia", "Guiana", "Guiné Bissau", "Guiné",
                "Honduras", "Indonésia", "Irã", "Iraque", "Laos", "Líbano", "Malásia", "Maldivas", "Marrocos",
                "Mongólia", "Myanmar", "Namíbia", "Nauru", "Nepal", "Nicarágua", "Panamá", "Paraguai",
                "Rep. Centro Africana", "República Togolesa", "Samoa", "Serra Leoa", "Síria", "Somália",
                "Sri Lanka", "Suriname", "Tadjiquistão", "Tailândia", "Timor-Leste", "Uzbequistão",
                "Vietnã", "Zimbábue"));
        groupA.setSystemConfiguration(config);

        CountryGroup groupB = new CountryGroup();
        groupB.setGroupName("B");
        groupB.setValueUSD(BigDecimal.valueOf(260.0));
        groupB.setCountriesList(List.of("África do Sul", "Albânia", "Andorra", "Argélia", "Argentina", "Austrália",
                "Belize", "Bósnia-Herzegovina", "Burundi", "Cabo Verde", "Camarões", "Camboja", "Catar", "Chade",
                "China", "Chipre", "Colômbia", "Dominica", "Egito", "Eritréia", "Estônia", "Etiópia", "Gana", "Geórgia",
                "Haiti", "Kiribati", "Líbia", "Macedônia", "Madagascar", "Malauí",
                "Micronésia", "Moçambique", "Moldávia", "Níger", "Nigéria", "Nova Zelândia", "Palau",
                "Papua Nova Guiné", "Paquistão", "Peru", "Polônia", "Quênia", "República Dominicana",
                "República Eslovaca", "Romênia", "Ruanda", "São Tomé e Príncipe", "Senegal", "Sudão", "Tanzânia",
                "Turcomenistão", "Turquia"));
        groupB.setSystemConfiguration(config);

        CountryGroup groupC = new CountryGroup();
        groupC.setGroupName("C");
        groupC.setValueUSD(BigDecimal.valueOf(310.0));
        groupC.setCountriesList(List.of("Antígua e Barbuda", "Arábia Saudita", "Azerbaijão", "Bahamas", "Bahrein",
                "Brunei Darussalam", "Bulgária", "Cingapura", "Congo", "Costa do Marfim", "Cuba",
                "Djibuti", "Emirados Árabes", "Fiji", "Gabão", "Guatemala", "Jamaica", "Jordânia", "Letônia", "Libéria",
                "Lituânia", "Mali", "Malta", "Maurício", "Mauritânia", "México", "República Democrática do Congo",
                "República Tcheca", "Rússia", "San Marino", "Santa Lúcia", "São Cristóvão e Nêvis",
                "São Vicente e Granadinas", "Taiwan", "Trinidad e Tobago", "Ucrânia", "Uganda", "Zâmbia"));
        groupC.setSystemConfiguration(config);

        CountryGroup groupD = new CountryGroup();
        groupD.setGroupName("D");
        groupD.setValueUSD(BigDecimal.valueOf(370.0));
        groupD.setCountriesList(List.of("Alemanha", "Áustria", "Barbados", "Bélgica", "Canadá", "Coréia do Sul",
                "Croácia", "Dinamarca", "Espanha", "Estados Unidos da América", "Finlândia", "França", "Granada",
                "Grécia", "Hong Kong", "Irlanda", "Islândia", "Israel", "Itália", "Japão", "Kuaite", "Liechtenstein",
                "Luxemburgo", "Mônaco", "Montenegro", "Noruega", "Omã", "Países Baixos", "Portugal", "Reino Unido",
                "República Quirguiz", "Seicheles", "Sérvia", "Suazilândia", "Suécia", "Suíça", "Vanuatu"));
        groupD.setSystemConfiguration(config);

        countryGroups.add(groupA);
        countryGroups.add(groupB);
        countryGroups.add(groupC);
        countryGroups.add(groupD);

        config.setCountryGroups(countryGroups);

        return repository.save(config);
    }
}