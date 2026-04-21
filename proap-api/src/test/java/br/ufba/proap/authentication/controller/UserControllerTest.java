package br.ufba.proap.authentication.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import br.ufba.proap.authentication.domain.Perfil;
import br.ufba.proap.authentication.domain.Permission;
import br.ufba.proap.authentication.domain.User;
import br.ufba.proap.authentication.domain.dto.CreateUserDTO;
import br.ufba.proap.authentication.domain.dto.UserUpdateDTO;
import br.ufba.proap.authentication.service.UserService;
import br.ufba.proap.exception.DefaultProfileNotFoundException;
import jakarta.validation.ValidationException;

class UserControllerTest {

	@Mock
	private UserService userService;

	@InjectMocks
	private UserController userController;

	private MockMvc mockMvc;

	private User testUser;
	private User adminUser;
	private Perfil userPerfil;
	private Perfil adminPerfil;
	private Permission viewUserPermission;
	private Permission adminRolePermission;

	private static final String TEST_NAME = "Test User";
	private static final String TEST_EMAIL = "test@example.com";
	private static final String TEST_PASSWORD = "password123";
	private static final String TEST_CPF = "12345678900";
	private static final String TEST_PHONE = "71999887766";
	private static final String TEST_REGISTRATION = "202312345";
	private static final String TEST_ALT_PHONE = "71988776655";

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
		mockMvc = MockMvcBuilders.standaloneSetup(userController).build();

		// Configurar permissões
		viewUserPermission = new Permission();
		viewUserPermission.setId(1L);
		viewUserPermission.setKey("VIEW_USER");
		viewUserPermission.setDescription("Permission to view users");
		viewUserPermission.setEnabled(true);

		adminRolePermission = new Permission();
		adminRolePermission.setId(2L);
		adminRolePermission.setKey("ADMIN_ROLE");
		adminRolePermission.setDescription("Admin permission");
		adminRolePermission.setEnabled(true);

		// Configurar perfis
		userPerfil = new Perfil();
		userPerfil.setId(1L);
		userPerfil.setName("Discente");
		Set<Permission> userPermissions = new HashSet<>();
		userPerfil.setPermissions(userPermissions);

		adminPerfil = new Perfil();
		adminPerfil.setId(2L);
		adminPerfil.setName("Admin");
		Set<Permission> adminPermissions = new HashSet<>();
		adminPermissions.add(viewUserPermission);
		adminPermissions.add(adminRolePermission);
		adminPerfil.setPermissions(adminPermissions);

		// Configurar usuários
		testUser = new User();
		testUser.setName(TEST_NAME);
		testUser.setEmail(TEST_EMAIL);
		testUser.setPassword(TEST_PASSWORD);
		testUser.setCpf(TEST_CPF);
		testUser.setPhone(TEST_PHONE);
		testUser.setPerfil(userPerfil);

		adminUser = new User();
		adminUser.setName("Admin User");
		adminUser.setEmail("admin@example.com");
		adminUser.setPassword(TEST_PASSWORD);
		adminUser.setCpf("00000000000");
		adminUser.setPhone("71999995555");
		adminUser.setPerfil(adminPerfil);
	}

	@Test
	void create_withValidUser_shouldReturnCreatedUser() throws Exception {
		String jsonPayload = String.format(
				"{\"email\":\"%s\",\"password\":\"%s\",\"name\":\"%s\",\"cpf\":\"%s\",\"registration\":\"%s\",\"phone\":\"%s\",\"alternativePhone\":\"%s\"}",
				TEST_EMAIL, TEST_PASSWORD, TEST_NAME, TEST_CPF, TEST_REGISTRATION, TEST_PHONE, TEST_ALT_PHONE);

		mockMvc.perform(post("/api/user/create")
				.contentType(MediaType.APPLICATION_JSON)
				.content(jsonPayload))
				.andExpect(status().isCreated()) // Alterado para isCreated()
				.andExpect(jsonPath("$.status").value("Sucesso"))
				.andExpect(jsonPath("$.message").value("Usuário criado com sucesso!"));

		verify(userService).create(any(CreateUserDTO.class));
	}

	@Test
	void create_whenDefaultProfileNotFound_shouldReturnInternalServerError() throws Exception {
		doThrow(new DefaultProfileNotFoundException("Perfil padrão não encontrado"))
				.when(userService).create(any(CreateUserDTO.class));

		String jsonPayload = String.format(
				"{\"email\":\"%s\",\"password\":\"%s\",\"name\":\"%s\",\"cpf\":\"%s\",\"registration\":\"%s\",\"phone\":\"%s\",\"alternativePhone\":\"%s\"}",
				TEST_EMAIL, TEST_PASSWORD, TEST_NAME, TEST_CPF, TEST_REGISTRATION, TEST_PHONE, TEST_ALT_PHONE);

		mockMvc.perform(post("/api/user/create")
				.contentType(MediaType.APPLICATION_JSON)
				.content(jsonPayload))
				.andExpect(status().isInternalServerError())
				.andExpect(jsonPath("$.status").value("Conta não criada"))
				.andExpect(jsonPath("$.message").value("Perfil padrão não encontrado"));

		verify(userService).create(any(CreateUserDTO.class));
	}

	@Test
	void create_whenValidationFails_shouldReturnBadRequest() throws Exception {
		String shortPassword = "short";
		doThrow(new ValidationException("A senha deve ter no mínimo 8 caracteres"))
				.when(userService).create(any(CreateUserDTO.class));

		String jsonPayload = String.format(
				"{\"email\":\"%s\",\"password\":\"%s\",\"name\":\"%s\",\"cpf\":\"%s\",\"registration\":\"%s\",\"phone\":\"%s\",\"alternativePhone\":\"%s\"}",
				TEST_EMAIL, shortPassword, TEST_NAME, TEST_CPF, TEST_REGISTRATION, TEST_PHONE, TEST_ALT_PHONE);

		mockMvc.perform(post("/api/user/create")
				.contentType(MediaType.APPLICATION_JSON)
				.content(jsonPayload))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value("Inválido"))
				.andExpect(jsonPath("$.message").value("A senha deve ter no mínimo 8 caracteres"));

		verify(userService).create(any(CreateUserDTO.class));
	}

	@Test
	void list_whenUserHasViewUserPermission_shouldReturnUserList() throws Exception {
		when(userService.getLoggedUser()).thenReturn(adminUser);
		when(userService.getAllUsersWithPerfilAndPermissions()).thenReturn(Arrays.asList(testUser, adminUser));

		mockMvc.perform(get("/api/user/list"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].email").value(TEST_EMAIL))
				.andExpect(jsonPath("$[1].email").value("admin@example.com"));

		verify(userService).getLoggedUser();
		verify(userService).getAllUsersWithPerfilAndPermissions();
	}

	@Test
	void list_whenUserDoesNotHavePermission_shouldReturnForbidden() throws Exception {
		when(userService.getLoggedUser()).thenReturn(testUser);

		mockMvc.perform(get("/api/user/list"))
				.andExpect(status().isForbidden());

		verify(userService).getLoggedUser();
		verify(userService, times(0)).getAllUsersWithPerfilAndPermissions();
	}

	@Test
	void currentUserInfo_shouldReturnLoggedUserInfo() throws Exception {
		when(userService.getLoggedUser()).thenReturn(testUser);

		mockMvc.perform(get("/api/user/info"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value(TEST_NAME))
				.andExpect(jsonPath("$.email").value(TEST_EMAIL))
				.andExpect(jsonPath("$.cpf").value(TEST_CPF))
				.andExpect(jsonPath("$.phone").value(TEST_PHONE));

		verify(userService).getLoggedUser();
	}

	@Test
	void currentUserInfo_whenNotAuthenticated_shouldReturnUnauthorized() throws Exception {
		when(userService.getLoggedUser()).thenReturn(null);

		mockMvc.perform(get("/api/user/info"))
				.andExpect(status().isUnauthorized());

		verify(userService).getLoggedUser();
	}

	@Test
	void update_withValidData_shouldReturnUpdatedUser() throws Exception {
		UserUpdateDTO updateDTO = new UserUpdateDTO();
		updateDTO.setName("Updated Name");
		updateDTO.setPhone("71988776655");

		User updatedUser = new User();
		updatedUser.setName("Updated Name");
		updatedUser.setEmail(TEST_EMAIL);
		updatedUser.setPhone("71988776655");
		updatedUser.setCpf(TEST_CPF);
		updatedUser.setPerfil(userPerfil);

		when(userService.update(any(UserUpdateDTO.class))).thenReturn(updatedUser);

		mockMvc.perform(put("/api/user/update")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"name\":\"Updated Name\",\"phone\":\"71988776655\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("Updated Name"))
				.andExpect(jsonPath("$.phone").value("71988776655"));

		verify(userService).update(any(UserUpdateDTO.class));
	}

	@Test
	void update_whenServiceThrowsException_shouldReturnBadRequest() throws Exception {
		when(userService.update(any(UserUpdateDTO.class))).thenThrow(new RuntimeException("Erro ao atualizar usuário"));

		mockMvc.perform(put("/api/user/update")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"name\":\"Updated Name\",\"phone\":\"71988776655\"}"))
				.andExpect(status().isBadRequest());

		verify(userService).update(any(UserUpdateDTO.class));
	}

	@Test
	void delete_whenUserHasAdminPermission_shouldDeleteUser() throws Exception {
		mockMvc.perform(delete("/api/user/delete/{email}", "user.to.delete@example.com"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("Sucesso"))
				.andExpect(jsonPath("$.message").value("Usuário deletado com sucesso!"));

		verify(userService).delete("user.to.delete@example.com");
	}

	@Test
	void delete_whenUserDoesNotHavePermission_shouldReturnForbidden() throws Exception {
		doThrow(new ValidationException("Você não tem permissão para deletar um usuário"))
				.when(userService).delete(anyString());

		mockMvc.perform(delete("/api/user/delete/{email}", "user.to.delete@example.com"))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.status").value("Erro"))
				.andExpect(jsonPath("$.message").value("Você não tem permissão para deletar um usuário"));

		verify(userService).delete("user.to.delete@example.com");
	}

	@Test
	void changePassword_withValidData_shouldReturnSuccess() throws Exception {
		mockMvc.perform(put("/api/user/change-password")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"currentPassword\":\"" + TEST_PASSWORD + "\",\"newPassword\":\"newPassword123\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("Sucesso"))
				.andExpect(jsonPath("$.message").value("Senha alterada com sucesso!"));

		verify(userService).changePassword(TEST_PASSWORD, "newPassword123");
	}

	@Test
	void changePassword_whenCurrentPasswordIncorrect_shouldReturnBadRequest() throws Exception {
		doThrow(new ValidationException("Senha atual incorreta"))
				.when(userService).changePassword(anyString(), anyString());

		mockMvc.perform(put("/api/user/change-password")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"currentPassword\":\"wrongPassword\",\"newPassword\":\"newPassword123\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value("Inválido"))
				.andExpect(jsonPath("$.message").value("Senha atual incorreta"));

		verify(userService).changePassword("wrongPassword", "newPassword123");
	}

	@Test
	void updateProfile_withValidData_shouldReturnSuccess() throws Exception {
		mockMvc.perform(put("/api/user/update-profile/{email}", TEST_EMAIL)
				.param("profileId", "2"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("Sucesso"))
				.andExpect(jsonPath("$.message").value("Perfil atualizado com sucesso!"));

		verify(userService).updateProfile(eq(TEST_EMAIL), eq(2L));
	}

	@Test
	void updateProfile_whenUserDoesNotExist_shouldReturnBadRequest() throws Exception {
		doThrow(new ValidationException("Usuário não encontrado"))
				.when(userService).updateProfile(anyString(), anyLong());

		mockMvc.perform(put("/api/user/update-profile/{email}", "nonexistent@example.com")
				.param("profileId", "2"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value("Inválido"))
				.andExpect(jsonPath("$.message").value("Usuário não encontrado"));

		verify(userService).updateProfile(eq("nonexistent@example.com"), eq(2L));
	}

	@Test
	void updateProfile_whenProfileDoesNotExist_shouldReturnBadRequest() throws Exception {
		doThrow(new ValidationException("Perfil não encontrado"))
				.when(userService).updateProfile(anyString(), anyLong());

		mockMvc.perform(put("/api/user/update-profile/{email}", TEST_EMAIL)
				.param("profileId", "999"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value("Inválido"))
				.andExpect(jsonPath("$.message").value("Perfil não encontrado"));

		verify(userService).updateProfile(eq(TEST_EMAIL), eq(999L));
	}
}
