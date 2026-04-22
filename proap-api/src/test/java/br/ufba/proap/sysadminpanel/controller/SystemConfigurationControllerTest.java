package br.ufba.proap.sysadminpanel.controller;

import br.ufba.proap.authentication.domain.User;
import br.ufba.proap.authentication.domain.Perfil;
import br.ufba.proap.authentication.domain.Permission;
import br.ufba.proap.authentication.service.UserService;

import br.ufba.proap.sysadminpanel.domain.dto.SystemConfigurationDTO;
import br.ufba.proap.sysadminpanel.domain.dto.UrlMapperDTO;
import br.ufba.proap.sysadminpanel.service.SystemConfigurationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class SystemConfigurationControllerTest {

    @Mock
    private SystemConfigurationService systemConfigurationService;

    @Mock
    private UserService userService;

    @InjectMocks
    private SystemConfigurationController systemConfigurationController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private User adminUser;
    private User regularUser;

    @BeforeEach
    public void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(systemConfigurationController).build();
        objectMapper = new ObjectMapper();

        Permission adminRolePermission = new Permission();
        adminRolePermission.setId(1L);
        adminRolePermission.setKey("ADMIN_ROLE");
        adminRolePermission.setDescription("Admin permission");
        adminRolePermission.setEnabled(true);

        Permission userRolePermission = new Permission();
        userRolePermission.setId(2L);
        userRolePermission.setKey("USER_ROLE");
        userRolePermission.setDescription("User permission");
        userRolePermission.setEnabled(true);

        Perfil adminPerfil = new Perfil();
        adminPerfil.setId(2L);
        adminPerfil.setName("Admin");
        Set<Permission> adminPermissions = new HashSet<>();
        adminPermissions.add(adminRolePermission);
        adminPermissions.add(userRolePermission);
        adminPerfil.setPermissions(adminPermissions);

        Perfil regularPerfil = new Perfil();
        regularPerfil.setId(1L);
        regularPerfil.setName("Discente");
        Set<Permission> userPermissions = new HashSet<>();
        userPermissions.add(userRolePermission);
        regularPerfil.setPermissions(userPermissions);

        adminUser = new User();
        adminUser.setName("Admin User");
        adminUser.setEmail("admin@example.com");
        adminUser.setPerfil(adminPerfil);

        regularUser = new User();
        regularUser.setName("Regular User");
        regularUser.setEmail("regular@example.com");
        regularUser.setPerfil(regularPerfil);

    }

    private void mockAdminUser() {
        when(userService.getLoggedUser()).thenReturn(adminUser);
    }

    private void mockRegularUser() {
        when(userService.getLoggedUser()).thenReturn(regularUser);
    }

    @Test
    void getCurrentConfiguration_shouldReturnConfiguration() throws Exception {
        SystemConfigurationDTO configDTO = new SystemConfigurationDTO();
        configDTO.setEnableSolicitation(true);
        configDTO.setQualis(Arrays.asList("A1", "A2"));
        configDTO.setResourceLinks(Collections.emptyList());
        configDTO.setCountryGroups(Collections.emptyList());
        when(systemConfigurationService.getCurrentConfiguration()).thenReturn(configDTO);

        mockMvc.perform(get("/api/admin/system-config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enableSolicitation").value(true))
                .andExpect(jsonPath("$.qualis[0]").value("A1"));
    }

    @Test
    void updateConfiguration_whenUserIsAdmin_shouldUpdateAndReturnConfiguration() throws Exception {
        mockAdminUser();
        SystemConfigurationDTO configDTO = new SystemConfigurationDTO();
        configDTO.setEnableSolicitation(true);
        configDTO.setQualis(Arrays.asList("A1", "A2"));
        configDTO.setResourceLinks(Collections.emptyList());
        configDTO.setCountryGroups(Collections.emptyList());
        when(systemConfigurationService.updateConfiguration(any(SystemConfigurationDTO.class))).thenReturn(configDTO);

        mockMvc.perform(put("/admin/system-config")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(configDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enableSolicitation").value(true));
    }

    @Test
    void updateConfiguration_whenUserIsNotAdmin_shouldReturnForbidden() throws Exception {
        mockRegularUser();
        SystemConfigurationDTO configDTO = new SystemConfigurationDTO();
        configDTO.setEnableSolicitation(true);
        configDTO.setQualis(Arrays.asList("A1", "A2"));
        configDTO.setResourceLinks(Collections.emptyList());
        configDTO.setCountryGroups(Collections.emptyList());

        mockMvc.perform(put("/admin/system-config")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(configDTO)))
                .andExpect(status().isForbidden());
    }

    @Test
    void partialUpdateConfiguration_whenUserIsAdmin_shouldUpdateAndReturnConfiguration() throws Exception {
        mockAdminUser();
        SystemConfigurationDTO configDTO = new SystemConfigurationDTO();
        configDTO.setEnableSolicitation(false);
        SystemConfigurationDTO updatedConfigDTO = new SystemConfigurationDTO();
        updatedConfigDTO.setEnableSolicitation(false);
        updatedConfigDTO.setQualis(Arrays.asList("B1"));
        UrlMapperDTO urlMapperDTO = new UrlMapperDTO();
        urlMapperDTO.setFieldName("Test");
        urlMapperDTO.setUrl("http://test.com");
        urlMapperDTO.setUrlTitle("Test URL");
        urlMapperDTO.setId(1L);
        updatedConfigDTO.setResourceLinks(Collections.singletonList(urlMapperDTO));

        when(systemConfigurationService.updateConfiguration(any(SystemConfigurationDTO.class)))
                .thenReturn(updatedConfigDTO);

        mockMvc.perform(patch("/admin/system-config")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(configDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enableSolicitation").value(false))
                .andExpect(jsonPath("$.qualis[0]").value("B1"));
    }

    @Test
    void partialUpdateConfiguration_whenUserIsNotAdmin_shouldReturnForbidden() throws Exception {
        mockRegularUser();
        SystemConfigurationDTO configDTO = new SystemConfigurationDTO();
        configDTO.setEnableSolicitation(false);

        mockMvc.perform(patch("/admin/system-config")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(configDTO)))
                .andExpect(status().isForbidden());
    }

    @Test
    void getQualisList_shouldReturnQualisList() throws Exception {
        List<String> qualis = Arrays.asList("A1", "B1");
        SystemConfigurationDTO configDTO = new SystemConfigurationDTO();
        configDTO.setEnableSolicitation(true);
        configDTO.setQualis(qualis);
        configDTO.setResourceLinks(Collections.emptyList());
        configDTO.setCountryGroups(Collections.emptyList());
        when(systemConfigurationService.getCurrentConfiguration()).thenReturn(configDTO);

        mockMvc.perform(get("/api/admin/system-config/qualis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("A1"))
                .andExpect(jsonPath("$[1]").value("B1"));
    }

    @Test
    void updateQualisList_whenUserIsAdmin_shouldUpdateAndReturnQualisList() throws Exception {
        mockAdminUser();
        List<String> qualisList = Arrays.asList("C1", "C2");
        when(systemConfigurationService.updateQualisList(anyList())).thenReturn(qualisList);

        mockMvc.perform(post("/api/admin/system-config/qualis")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(qualisList)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("C1"));
    }

    @Test
    void updateQualisList_whenUserIsNotAdmin_shouldReturnForbidden() throws Exception {
        mockRegularUser();
        List<String> qualisList = Arrays.asList("C1", "C2");

        mockMvc.perform(post("/api/admin/system-config/qualis")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(qualisList)))
                .andExpect(status().isForbidden());
    }

    @Test
    void getResourceLinks_shouldReturnResourceLinks() throws Exception {
        UrlMapperDTO urlMapperDTO = new UrlMapperDTO();
        urlMapperDTO.setFieldName("Google");
        urlMapperDTO.setUrl("http://google.com");
        urlMapperDTO.setUrlTitle("Google URL");
        urlMapperDTO.setId(1L);
        List<UrlMapperDTO> resourceLinks = Collections.singletonList(urlMapperDTO);
        SystemConfigurationDTO configDTO = new SystemConfigurationDTO();
        configDTO.setEnableSolicitation(true);
        configDTO.setQualis(Collections.emptyList());
        configDTO.setResourceLinks(resourceLinks);
        configDTO.setCountryGroups(Collections.emptyList());
        when(systemConfigurationService.getCurrentConfiguration()).thenReturn(configDTO);

        mockMvc.perform(get("/api/admin/system-config/resource-links"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fieldName").value("Google"))
                .andExpect(jsonPath("$[0].url").value("http://google.com"));
    }

    @Test
    void updateResourceLinks_whenUserIsAdmin_shouldUpdateAndReturnResourceLinks() throws Exception {
        mockAdminUser();
        UrlMapperDTO urlMapperDTO = new UrlMapperDTO();
        urlMapperDTO.setFieldName("Bing");
        urlMapperDTO.setUrl("http://bing.com");
        urlMapperDTO.setUrlTitle("Bing URL");
        List<UrlMapperDTO> resourceLinks = Collections.singletonList(urlMapperDTO);
        when(systemConfigurationService.updateResourceLinks(anyList())).thenReturn(resourceLinks);

        mockMvc.perform(post("/api/admin/system-config/resource-links")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resourceLinks)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fieldName").value("Bing"));
    }

    @Test
    void updateResourceLinks_whenUserIsNotAdmin_shouldReturnForbidden() throws Exception {
        mockRegularUser();
        UrlMapperDTO urlMapperDTO = new UrlMapperDTO();
        urlMapperDTO.setFieldName("Bing");
        urlMapperDTO.setUrl("http://bing.com");
        urlMapperDTO.setUrlTitle("Bing URL");
        List<UrlMapperDTO> resourceLinks = Collections.singletonList(urlMapperDTO);

        mockMvc.perform(post("/api/admin/system-config/resource-links")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resourceLinks)))
                .andExpect(status().isForbidden());
    }
}
