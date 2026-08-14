package br.ufba.proap.adminpanel.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import br.ufba.proap.authentication.domain.Perfil;
import br.ufba.proap.authentication.domain.Permission;
import br.ufba.proap.authentication.domain.User;
import br.ufba.proap.authentication.service.UserService;
import br.ufba.proap.sysadminpanel.controller.SystemConfigurationController;
import br.ufba.proap.sysadminpanel.domain.dto.SystemConfigurationDTO;
import br.ufba.proap.sysadminpanel.service.SystemConfigurationService;

@ExtendWith(MockitoExtension.class)
public class SystemConfigurationControllerTest {

    @Mock
    private SystemConfigurationService configService;

    @Mock
    private UserService userService;

    @InjectMocks
    private SystemConfigurationController controller;

    private SystemConfigurationDTO sampleConfig;
    private User adminUser;
    private User regularUser;

    @BeforeEach
    public void setup() {
        // Configuração de exemplo
        sampleConfig = new SystemConfigurationDTO();
        sampleConfig.setId(1L);
        sampleConfig.setQualis(Arrays.asList("A1", "A2", "B1"));
        sampleConfig.setNumMaxDiarias(5);
        sampleConfig.setValorDiariaBRL(BigDecimal.valueOf(320.0));
        sampleConfig.setSitePgcompURL("http://example.com/guia-qualis");
        sampleConfig.setResolucaoProapURL("http://example.com/resolucao-proap");
        sampleConfig.setTextoAvisoQualis("Aviso sobre Qualis");
        sampleConfig.setTextoAvisoValorInscricao("Aviso sobre inscrição");
        sampleConfig.setTextoInformacaoQtdDiarias("Informação sobre diárias");

        // Configuração de usuário administrador
        adminUser = new User();
        Perfil adminPerfil = new Perfil();
        Permission permission = new Permission();
        permission.setKey("ADMIN_ROLE");
        permission.setEnabled(true);
        adminPerfil.setPermissions(Set.of(permission));
        adminUser.setPerfil(adminPerfil);

        // Configuração de usuário comum (COM PERMISSIONS INICIALIZADAS VAZIAS)
        regularUser = new User();
        Perfil regularPerfil = new Perfil();
        regularPerfil.setPermissions(Collections.emptySet()); // Evita o NullPointerException
        regularUser.setPerfil(regularPerfil);
    }

    @Test
    public void testGetCurrentConfiguration() {
        // Given
        when(configService.getCurrentConfiguration()).thenReturn(sampleConfig);

        // When
        ResponseEntity<SystemConfigurationDTO> response = controller.getCurrentConfiguration();

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(sampleConfig, response.getBody());
    }

    @Test
    public void testUpdateConfiguration_Admin() {
        // Given
        when(userService.getLoggedUser()).thenReturn(adminUser);
        when(configService.updateConfiguration(any(SystemConfigurationDTO.class))).thenReturn(sampleConfig);

        // When
        ResponseEntity<SystemConfigurationDTO> response = controller.updateConfiguration(sampleConfig);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(sampleConfig, response.getBody());
    }

    @Test
    public void testUpdateConfiguration_NotAdmin() {
        // Given
        when(userService.getLoggedUser()).thenReturn(regularUser);

        // When
        ResponseEntity<SystemConfigurationDTO> response = controller.updateConfiguration(sampleConfig);

        // Then
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    public void testPartialUpdateConfiguration_Admin() {
        // Given
        when(userService.getLoggedUser()).thenReturn(adminUser);
        when(configService.updateConfiguration(any(SystemConfigurationDTO.class))).thenReturn(sampleConfig);

        SystemConfigurationDTO partialConfig = new SystemConfigurationDTO();
        partialConfig.setNumMaxDiarias(7);

        // When
        ResponseEntity<SystemConfigurationDTO> response = controller.partialUpdateConfiguration(partialConfig);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(sampleConfig, response.getBody());
    }

    @Test
    public void testPartialUpdateConfiguration_NotAdmin() {
        // Given
        when(userService.getLoggedUser()).thenReturn(regularUser);

        SystemConfigurationDTO partialConfig = new SystemConfigurationDTO();
        partialConfig.setNumMaxDiarias(7);

        // When
        ResponseEntity<SystemConfigurationDTO> response = controller.partialUpdateConfiguration(partialConfig);

        // Then
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    public void testGetQualisList() {
        // Given
        when(configService.getCurrentConfiguration()).thenReturn(sampleConfig);

        // When
        ResponseEntity<List<String>> response = controller.getQualisList();

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(Arrays.asList("A1", "A2", "B1"), response.getBody());
    }

    @Test
    public void testUpdateQualisList_Admin() {
        // Given
        when(userService.getLoggedUser()).thenReturn(adminUser);
        List<String> newQualisList = Arrays.asList("A1", "A2", "A3", "A4", "B1");
        when(configService.updateQualisList(eq(newQualisList))).thenReturn(newQualisList);

        // When
        ResponseEntity<List<String>> response = controller.updateQualisList(newQualisList);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(newQualisList, response.getBody());
    }

    @Test
    public void testUpdateQualisList_NotAdmin() {
        // Given
        when(userService.getLoggedUser()).thenReturn(regularUser);
        List<String> newQualisList = Arrays.asList("A1", "A2", "A3", "A4", "B1");

        // When
        ResponseEntity<List<String>> response = controller.updateQualisList(newQualisList);

        // Then
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    public void testHasAdminPermission_ExceptionHandling() {
        // Given
        when(userService.getLoggedUser()).thenThrow(new RuntimeException("Erro simulado"));

        // When
        ResponseEntity<SystemConfigurationDTO> response = controller.updateConfiguration(sampleConfig);

        // Then
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }
}