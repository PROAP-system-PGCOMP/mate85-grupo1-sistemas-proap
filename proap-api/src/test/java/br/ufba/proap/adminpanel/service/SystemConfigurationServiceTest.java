package br.ufba.proap.adminpanel.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.ArrayList;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.ufba.proap.sysadminpanel.domain.SystemConfiguration;
import br.ufba.proap.sysadminpanel.domain.UrlMapper;
import br.ufba.proap.sysadminpanel.domain.dto.CountryGroupDTO;
import br.ufba.proap.sysadminpanel.domain.dto.SystemConfigurationDTO;
import br.ufba.proap.sysadminpanel.domain.dto.UrlMapperDTO;
import br.ufba.proap.sysadminpanel.repository.SystemConfigurationRepository;
import br.ufba.proap.sysadminpanel.service.SystemConfigurationService;

@ExtendWith(MockitoExtension.class)
public class SystemConfigurationServiceTest {

    @Mock
    private SystemConfigurationRepository repository;

    @InjectMocks
    private SystemConfigurationService service;

    private SystemConfiguration sampleConfig;
    private List<UrlMapper> sampleUrls;

    @BeforeEach
    public void setup() {
        // Configuração de exemplo para URLs
        sampleUrls = new ArrayList<>();
        UrlMapper url1 = new UrlMapper();
        url1.setId(1L);
        url1.setUrl("http://example.com/url1");
        url1.setFieldName("Campo 1");
        url1.setUrlTitle("Link 1");

        UrlMapper url2 = new UrlMapper();
        url2.setId(2L);
        url2.setUrl("http://example.com/url2");
        url2.setFieldName("Campo 2");
        url2.setUrlTitle("Link 2");

        sampleUrls.add(url1);
        sampleUrls.add(url2);

        // Configuração de exemplo
        sampleConfig = new SystemConfiguration();
        sampleConfig.setId(1L);
        sampleConfig.setQualisList(Arrays.asList("A1", "A2", "B1"));
        sampleConfig.setNumMaxDiarias(5);
        sampleConfig.setValorDiariaBRL(BigDecimal.valueOf(320.0));
        sampleConfig.setSitePgcompURL("http://example.com/guia-qualis");
        sampleConfig.setResolucaoProapURL("http://example.com/resolucao-proap");
        sampleConfig.setTextoAvisoQualis("Aviso sobre Qualis");
        sampleConfig.setTextoAvisoValorInscricao("Aviso sobre inscrição");
        sampleConfig.setTextoInformacaoQtdDiarias("Informação sobre diárias");
        sampleConfig.setResourceLinks(sampleUrls);
        sampleConfig.setEnableSolicitation(true);
    }

    @Test
    public void testGetCurrentConfiguration_Exists() {
        // Given
        when(repository.findAll()).thenReturn(List.of(sampleConfig));

        // When
        SystemConfigurationDTO result = service.getCurrentConfiguration();

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(Arrays.asList("A1", "A2", "B1"), result.getQualis());
        assertEquals(5, result.getNumMaxDiarias());
        assertEquals(BigDecimal.valueOf(320.0), result.getValorDiariaBRL());
        assertEquals(true, result.getEnableSolicitation());
        assertEquals(2, result.getResourceLinks().size());
        assertEquals("http://example.com/url1", result.getResourceLinks().get(0).getUrl());
    }

    @Test
    public void testGetCurrentConfiguration_NotExists() {
        // Given
        when(repository.findAll()).thenReturn(Collections.emptyList());
        when(repository.save(any(SystemConfiguration.class))).thenAnswer(invocation -> {
            SystemConfiguration savedConfig = invocation.getArgument(0);
            savedConfig.setId(1L);
            return savedConfig;
        });

        // When
        SystemConfigurationDTO result = service.getCurrentConfiguration();

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertNotNull(result.getQualis());
        assertNotNull(result.getNumMaxDiarias());
        assertNotNull(result.getValorDiariaBRL());
    }

    @Test
    public void testUpdateConfiguration_Exists() {
        // Given
        when(repository.findAll()).thenReturn(List.of(sampleConfig));
        when(repository.save(any(SystemConfiguration.class))).thenAnswer(invocation -> {
            SystemConfiguration savedConfig = invocation.getArgument(0);
            savedConfig.setNumMaxDiarias(7);
            savedConfig.setValorDiariaBRL(BigDecimal.valueOf(400.0));
            return savedConfig;
        });

        SystemConfigurationDTO updateDTO = new SystemConfigurationDTO();
        updateDTO.setNumMaxDiarias(7);
        updateDTO.setValorDiariaBRL(BigDecimal.valueOf(400.0));

        // When
        SystemConfigurationDTO result = service.updateConfiguration(updateDTO);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(Arrays.asList("A1", "A2", "B1"), result.getQualis());
        assertEquals(7, result.getNumMaxDiarias());
        assertEquals(BigDecimal.valueOf(400.0), result.getValorDiariaBRL());
    }

    @Test
    public void testUpdateConfiguration_NotExists() {
        // Given
        when(repository.findAll()).thenReturn(Collections.emptyList());
        when(repository.save(any(SystemConfiguration.class))).thenAnswer(invocation -> {
            SystemConfiguration savedConfig = invocation.getArgument(0);
            savedConfig.setId(1L);
            savedConfig.setNumMaxDiarias(7);
            savedConfig.setValorDiariaBRL(BigDecimal.valueOf(400.0));
            return savedConfig;
        });

        SystemConfigurationDTO updateDTO = new SystemConfigurationDTO();
        updateDTO.setNumMaxDiarias(7);
        updateDTO.setValorDiariaBRL(BigDecimal.valueOf(400.0));

        // When
        SystemConfigurationDTO result = service.updateConfiguration(updateDTO);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(7, result.getNumMaxDiarias());
        assertEquals(BigDecimal.valueOf(400.0), result.getValorDiariaBRL());
    }

    @Test
    public void testUpdateConfiguration_WithResourceLinks() {
        // Given
        when(repository.findAll()).thenReturn(List.of(sampleConfig));
        when(repository.save(any(SystemConfiguration.class))).thenAnswer(invocation -> {
            SystemConfiguration savedConfig = invocation.getArgument(0);
            // Simula comportamento do repositório para atualizar os links de recursos
            return savedConfig;
        });

        SystemConfigurationDTO updateDTO = new SystemConfigurationDTO();
        List<UrlMapperDTO> newLinks = new ArrayList<>();
        newLinks.add(new UrlMapperDTO(null, "http://example.com/new1", "Novo Campo 1", "Novo Link 1"));
        newLinks.add(new UrlMapperDTO(null, "http://example.com/new2", "Novo Campo 2", "Novo Link 2"));
        updateDTO.setResourceLinks(newLinks);

        // When
        SystemConfigurationDTO result = service.updateConfiguration(updateDTO);

        // Then
        assertNotNull(result);
        assertNotNull(result.getResourceLinks());
        assertEquals(2, result.getResourceLinks().size());
    }

    @Test
    public void testUpdateConfiguration_RejectsCountryInTwoGroups() {
        // Given
        when(repository.findAll()).thenReturn(List.of(sampleConfig));
        sampleConfig.setCountryGroups(new ArrayList<>());

        SystemConfigurationDTO updateDTO = new SystemConfigurationDTO();
        updateDTO.setCountryGroups(List.of(
                new CountryGroupDTO(null, "C", BigDecimal.valueOf(310), List.of("Canadá", "México")),
                new CountryGroupDTO(null, "D", BigDecimal.valueOf(370), List.of("  canada ", "Japão"))));

        // When / Then
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.updateConfiguration(updateDTO));
        assertTrue(ex.getMessage().contains("Canadá"));
        assertTrue(ex.getMessage().contains("C, D"));
        verify(repository, never()).save(any(SystemConfiguration.class));
    }

    @Test
    public void testUpdateConfiguration_AcceptsDisjointGroupsAndSavesTariffs() {
        // Given
        when(repository.findAll()).thenReturn(List.of(sampleConfig));
        sampleConfig.setCountryGroups(new ArrayList<>());
        when(repository.save(any(SystemConfiguration.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SystemConfigurationDTO updateDTO = new SystemConfigurationDTO();
        updateDTO.setValorDiariaAlunoBRL(BigDecimal.valueOf(320));
        updateDTO.setValorDiariaDocenteBRL(BigDecimal.valueOf(380));
        updateDTO.setValorDiariaDocenteSpRjBRL(BigDecimal.valueOf(425));
        updateDTO.setCountryGroups(List.of(
                new CountryGroupDTO(null, "C", BigDecimal.valueOf(310), List.of("México")),
                new CountryGroupDTO(null, "D", BigDecimal.valueOf(370), List.of("Canadá", "Japão"))));

        // When
        SystemConfigurationDTO result = service.updateConfiguration(updateDTO);

        // Then
        assertEquals(BigDecimal.valueOf(320), result.getValorDiariaAlunoBRL());
        assertEquals(BigDecimal.valueOf(380), result.getValorDiariaDocenteBRL());
        assertEquals(BigDecimal.valueOf(425), result.getValorDiariaDocenteSpRjBRL());
        assertEquals(2, result.getCountryGroups().size());
    }

    @Test
    public void testDefaultConfiguration_HasTariffsAndNoDuplicateCountries() {
        // Given
        when(repository.findAll()).thenReturn(Collections.emptyList());
        when(repository.save(any(SystemConfiguration.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        SystemConfigurationDTO result = service.getCurrentConfiguration();

        // Then
        assertEquals(0, BigDecimal.valueOf(320).compareTo(result.getValorDiariaAlunoBRL()));
        assertEquals(0, BigDecimal.valueOf(380).compareTo(result.getValorDiariaDocenteBRL()));
        assertEquals(0, BigDecimal.valueOf(425).compareTo(result.getValorDiariaDocenteSpRjBRL()));
        assertEquals(4, result.getCountryGroups().size());
        // nenhum país repetido entre grupos
        assertDoesNotThrow(() -> service.updateConfiguration(result));
    }

    @Test
    public void testUpdateQualisList() {
        // Given
        when(repository.findAll()).thenReturn(List.of(sampleConfig));

        List<String> newQualisList = Arrays.asList("A1", "A2", "A3", "A4", "B1");

        // Configurando comportamento do repository.save
        when(repository.save(any(SystemConfiguration.class))).thenAnswer(invocation -> {
            SystemConfiguration savedConfig = invocation.getArgument(0);
            savedConfig.setQualisList(newQualisList);
            return savedConfig;
        });

        // When
        List<String> result = service.updateQualisList(newQualisList);

        // Then
        assertNotNull(result);
        assertEquals(newQualisList, result);
        assertEquals(5, result.size());
    }

    @Test
    public void testUpdateQualisList_EmptyList() {
        // Given
        when(repository.findAll()).thenReturn(List.of(sampleConfig));

        List<String> newQualisList = Collections.emptyList();

        // Configurando comportamento do repository.save
        when(repository.save(any(SystemConfiguration.class))).thenAnswer(invocation -> {
            SystemConfiguration savedConfig = invocation.getArgument(0);
            savedConfig.setQualisList(newQualisList);
            return savedConfig;
        });

        // When
        List<String> result = service.updateQualisList(newQualisList);

        // Then
        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    public void testUpdateResourceLinks() {
        // Given
        when(repository.findAll()).thenReturn(List.of(sampleConfig));

        List<UrlMapperDTO> newLinks = new ArrayList<>();
        newLinks.add(new UrlMapperDTO(null, "http://example.com/updated1", "Campo Atualizado 1", "Link Atualizado 1"));
        newLinks.add(new UrlMapperDTO(null, "http://example.com/updated2", "Campo Atualizado 2", "Link Atualizado 2"));
        newLinks.add(new UrlMapperDTO(null, "http://example.com/updated3", "Campo Atualizado 3", "Link Atualizado 3"));

        // Configurando comportamento do repository.save
        when(repository.save(any(SystemConfiguration.class))).thenAnswer(invocation -> {
            SystemConfiguration savedConfig = invocation.getArgument(0);
            List<UrlMapper> updatedLinks = new ArrayList<>();
            for (int i = 0; i < newLinks.size(); i++) {
                UrlMapperDTO dto = newLinks.get(i);
                UrlMapper mapper = new UrlMapper();
                mapper.setId((long) (i + 1));
                mapper.setUrl(dto.getUrl());
                mapper.setFieldName(dto.getFieldName());
                mapper.setUrlTitle(dto.getUrlTitle());
                mapper.setSystemConfiguration(savedConfig);
                updatedLinks.add(mapper);
            }
            savedConfig.setResourceLinks(updatedLinks);
            return savedConfig;
        });

        // When
        List<UrlMapperDTO> result = service.updateResourceLinks(newLinks);

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals("http://example.com/updated1", result.get(0).getUrl());
        assertEquals("Campo Atualizado 2", result.get(1).getFieldName());
        assertEquals("Link Atualizado 3", result.get(2).getUrlTitle());
    }

    @Test
    public void testUpdateResourceLinks_EmptyList() {
        // Given
        when(repository.findAll()).thenReturn(List.of(sampleConfig));

        List<UrlMapperDTO> emptyLinks = new ArrayList<>();

        // Configurando comportamento do repository.save
        when(repository.save(any(SystemConfiguration.class))).thenAnswer(invocation -> {
            SystemConfiguration savedConfig = invocation.getArgument(0);
            savedConfig.setResourceLinks(new ArrayList<>());
            return savedConfig;
        });

        // When
        List<UrlMapperDTO> result = service.updateResourceLinks(emptyLinks);

        // Then
        assertNotNull(result);
        assertEquals(0, result.size());
    }

}