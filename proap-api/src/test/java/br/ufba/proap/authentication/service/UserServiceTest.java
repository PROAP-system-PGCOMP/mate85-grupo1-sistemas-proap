package br.ufba.proap.authentication.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import br.ufba.proap.authentication.domain.Perfil;
import br.ufba.proap.authentication.domain.Permission;
import br.ufba.proap.authentication.domain.User;
import br.ufba.proap.authentication.domain.dto.CreateUserDTO;
import br.ufba.proap.authentication.domain.dto.UserUpdateDTO;
import br.ufba.proap.authentication.domain.enums.ProfileStatus;
import br.ufba.proap.authentication.repository.UserRepository;
import br.ufba.proap.exception.DefaultProfileNotFoundException;
import br.ufba.proap.exception.UnauthorizedException;
import jakarta.validation.ValidationException;

class UserServiceTest {

    private static final String NAME_PARAM = "João Silva";
    private static final String CPF_PARAM = "12345678900";
    private static final String EMAIL_PARAM = "joao.silva@example.com";
    private static final String PASSWORD_PARAM = "senha12345";
    private static final String PASSWORD_ENCODED = "$2a$10$abcdefghijklmnopqrstuv";
    private static final String REGISTRATION_PARAM = "202301";
    private static final String PHONE_PARAM = "71999998888";
    private static final String ALT_PHONE_PARAM = "71999997777";
    private static final Long USER_ID = 1L;
    private static final Long PROFILE_ID = 2L;

    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PerfilService perfilService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserRequestValidationService userRequestValidationService;

    @Mock
    private SecurityContext securityContext;

    private User user;
    private User adminUser;
    private Perfil defaultPerfil;
    private Perfil adminPerfil;
    private Authentication authentication;
    private UserUpdateDTO userUpdateDTO;
    private List<User> userList;
    private CreateUserDTO createUserDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        SecurityContextHolder.setContext(securityContext);

        setupUser();
        setupAdminUser();
        setupPerfis();
        setupAuthentication();
        setupUserUpdateDTO();
        setupUserList();
        setupCreateUserDTO();
    }

    private void setupUser() {
        user = new User();
        user.setName(NAME_PARAM);
        user.setCpf(CPF_PARAM);
        user.setEmail(EMAIL_PARAM);
        user.setPassword(PASSWORD_PARAM);
        user.setRegistration(REGISTRATION_PARAM);
        user.setPhone(PHONE_PARAM);
        user.setAlternativePhone(ALT_PHONE_PARAM);

        when(userRepository.saveAndFlush(user)).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            setIdViaReflection(savedUser, USER_ID);
            return savedUser;
        });
        setIdViaReflection(user, USER_ID);
    }

    private void setupAdminUser() {
        adminUser = new User();
        adminUser.setName("Admin User");
        adminUser.setCpf("00000000000");
        adminUser.setEmail("admin@example.com");
        adminUser.setPassword(PASSWORD_PARAM);

        when(userRepository.saveAndFlush(adminUser)).thenAnswer(invocation -> {
            User savedUser = invocation.getArgument(0);
            setIdViaReflection(savedUser, 2L);
            return savedUser;
        });
        setIdViaReflection(adminUser, 2L);
    }

    private void setIdViaReflection(User user, Long id) {
        try {
            java.lang.reflect.Field idField = User.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(user, id);
        } catch (Exception e) {
            throw new RuntimeException("Não foi possível definir o ID do usuário via reflection", e);
        }
    }

    private void setupPerfis() {
        defaultPerfil = new Perfil();
        defaultPerfil.setId(1L);
        defaultPerfil.setName("USER");
        defaultPerfil.setPermissions(createPermissionSet("USER_ROLE"));

        adminPerfil = new Perfil();
        adminPerfil.setId(2L);
        adminPerfil.setName("ADMIN");
        adminPerfil.setPermissions(createPermissionSet("ADMIN_ROLE"));

        user.setPerfil(defaultPerfil);
        adminUser.setPerfil(adminPerfil);
    }

    private Set<Permission> createPermissionSet(String... permissionKeys) {
        Set<Permission> permissions = new java.util.HashSet<>();
        for (String key : permissionKeys) {
            Permission permission = new Permission();
            permission.setId(permissions.size() + 1L);
            permission.setKey(key);
            permission.setDescription("Permissão " + key);
            permission.setEnabled(true);
            permissions.add(permission);
        }
        return permissions;
    }

    private void setupAuthentication() {
        authentication = mock(Authentication.class);
    }

    private void setupUserUpdateDTO() {
        userUpdateDTO = new UserUpdateDTO();
        userUpdateDTO.setName("Nome Atualizado");
        userUpdateDTO.setRegistrationNumber("202302");
        userUpdateDTO.setPhone("71999995555");
        userUpdateDTO.setAlternativePhone("71999994444");
    }

    private void setupUserList() {
        userList = new ArrayList<>();
        userList.add(user);
        userList.add(adminUser);
    }

    private void setupCreateUserDTO() {
        createUserDTO = new CreateUserDTO(
                EMAIL_PARAM,
                PASSWORD_PARAM,
                NAME_PARAM,
                CPF_PARAM,
                REGISTRATION_PARAM,
                PHONE_PARAM,
                null,
                ALT_PHONE_PARAM);
    }

    @Test
    void loadUserByUsername_WhenUserExists_ShouldReturnUser() {
        when(userRepository.findByEmailWithPerfilAndPermissions(EMAIL_PARAM)).thenReturn(Optional.of(user));

        UserDetails result = userService.loadUserByUsername(EMAIL_PARAM);

        assertNotNull(result);
        assertEquals(user, result);
        assertEquals(EMAIL_PARAM, result.getUsername());
        verify(userRepository).findByEmailWithPerfilAndPermissions(EMAIL_PARAM);
    }

    @Test
    void loadUserByUsername_WhenUserDoesNotExist_ShouldThrowException() {
        when(userRepository.findByEmailWithPerfilAndPermissions(EMAIL_PARAM)).thenReturn(Optional.empty());

        UsernameNotFoundException exception = assertThrows(UsernameNotFoundException.class,
                () -> userService.loadUserByUsername(EMAIL_PARAM));

        assertEquals("Email user: " + EMAIL_PARAM + " not found", exception.getMessage());
        verify(userRepository).findByEmailWithPerfilAndPermissions(EMAIL_PARAM);
    }

    @Test
    void getLoggedUser_WhenPrincipalIsUserDetails_ShouldReturnLoggedUser() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(user);
        when(userRepository.findByEmailWithPerfilAndPermissions(EMAIL_PARAM)).thenReturn(Optional.of(user));

        User result = userService.getLoggedUser();

        assertNotNull(result);
        assertEquals(user, result);
        verify(securityContext).getAuthentication();
        verify(authentication).getPrincipal();
    }

    @Test
    void getLoggedUser_WhenPrincipalIsString_ShouldReturnLoggedUser() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(EMAIL_PARAM);
        when(userRepository.findByEmailWithPerfilAndPermissions(EMAIL_PARAM)).thenReturn(Optional.of(user));

        User result = userService.getLoggedUser();

        assertNotNull(result);
        assertEquals(user, result);
        verify(securityContext).getAuthentication();
        verify(authentication).getPrincipal();
    }

    @Test
    void create_WhenValidUserWithoutRequestedPerfil_ShouldCreateUserSuccessfully() {
        when(userRepository.findByEmail(EMAIL_PARAM)).thenReturn(Optional.empty());
        when(userRepository.findByCpf(CPF_PARAM)).thenReturn(Optional.empty());
        when(perfilService.findByName(Perfil.getDefaultPerfilName())).thenReturn(Optional.of(defaultPerfil));
        when(passwordEncoder.encode(PASSWORD_PARAM)).thenReturn(PASSWORD_ENCODED);

        userService.create(createUserDTO);

        verify(userRepository).findByEmail(EMAIL_PARAM);
        verify(userRepository).findByCpf(CPF_PARAM);
        verify(perfilService).findByName(Perfil.getDefaultPerfilName());
        verify(passwordEncoder).encode(PASSWORD_PARAM);
        verify(userRepository).saveAndFlush(argThat(savedUser -> savedUser.getEmail().equals(EMAIL_PARAM) &&
                savedUser.getName().equals(NAME_PARAM) &&
                savedUser.getCpf().equals(CPF_PARAM) &&
                savedUser.getPerfil().equals(defaultPerfil) &&
                savedUser.getRequestedPerfil() == null &&
                savedUser.getProfileStatus() == null));
    }

    @Test
    void create_WhenValidUserWithRequestedPerfil_ShouldCreateUserWithPendingStatus() {
        CreateUserDTO dtoWithRequestedPerfil = new CreateUserDTO(
                EMAIL_PARAM, PASSWORD_PARAM, NAME_PARAM, CPF_PARAM, REGISTRATION_PARAM, PHONE_PARAM, PROFILE_ID, ALT_PHONE_PARAM);

        when(userRepository.findByEmail(EMAIL_PARAM)).thenReturn(Optional.empty());
        when(userRepository.findByCpf(CPF_PARAM)).thenReturn(Optional.empty());
        when(perfilService.findByName(Perfil.getDefaultPerfilName())).thenReturn(Optional.of(defaultPerfil));
        when(perfilService.findById(PROFILE_ID)).thenReturn(Optional.of(adminPerfil));
        when(passwordEncoder.encode(PASSWORD_PARAM)).thenReturn(PASSWORD_ENCODED);

        userService.create(dtoWithRequestedPerfil);

        verify(userRepository).saveAndFlush(argThat(savedUser -> savedUser.getPerfil().equals(defaultPerfil) &&
                savedUser.getRequestedPerfil().equals(adminPerfil) &&
                savedUser.getProfileStatus() == ProfileStatus.PENDING));
    }

    @Test
    void create_WhenRequestedPerfilEqualsDefaultPerfil_ShouldNotSetPendingStatus() {
        CreateUserDTO dtoWithDefaultPerfilRequested = new CreateUserDTO(
                EMAIL_PARAM, PASSWORD_PARAM, NAME_PARAM, CPF_PARAM, REGISTRATION_PARAM, PHONE_PARAM, defaultPerfil.getId(), ALT_PHONE_PARAM);

        when(userRepository.findByEmail(EMAIL_PARAM)).thenReturn(Optional.empty());
        when(userRepository.findByCpf(CPF_PARAM)).thenReturn(Optional.empty());
        when(perfilService.findByName(Perfil.getDefaultPerfilName())).thenReturn(Optional.of(defaultPerfil));
        when(passwordEncoder.encode(PASSWORD_PARAM)).thenReturn(PASSWORD_ENCODED);

        userService.create(dtoWithDefaultPerfilRequested);

        verify(userRepository, never()).findById(defaultPerfil.getId());
        verify(userRepository).saveAndFlush(argThat(savedUser -> savedUser.getRequestedPerfil() == null &&
                savedUser.getProfileStatus() == null));
    }

    @Test
    void create_WhenRequestedPerfilNotFound_ShouldThrowNotFoundException() {
        CreateUserDTO dtoWithRequestedPerfil = new CreateUserDTO(
                EMAIL_PARAM, PASSWORD_PARAM, NAME_PARAM, CPF_PARAM, REGISTRATION_PARAM, PHONE_PARAM, PROFILE_ID, ALT_PHONE_PARAM);

        when(userRepository.findByEmail(EMAIL_PARAM)).thenReturn(Optional.empty());
        when(userRepository.findByCpf(CPF_PARAM)).thenReturn(Optional.empty());
        when(perfilService.findByName(Perfil.getDefaultPerfilName())).thenReturn(Optional.of(defaultPerfil));
        when(userRepository.findById(PROFILE_ID)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> userService.create(dtoWithRequestedPerfil));
        verify(userRepository, never()).saveAndFlush(any(User.class));
    }

    @Test
    void create_WhenEmailAlreadyExists_ShouldThrowValidationException() {
        when(userRepository.findByEmail(EMAIL_PARAM)).thenReturn(Optional.of(user));

        ValidationException exception = assertThrows(ValidationException.class,
                () -> userService.create(createUserDTO));

        assertEquals("Email já cadastrado", exception.getMessage());
        verify(userRepository, never()).saveAndFlush(any(User.class));
    }

    @Test
    void create_WhenCpfAlreadyExists_ShouldThrowValidationException() {
        when(userRepository.findByEmail(EMAIL_PARAM)).thenReturn(Optional.empty());
        when(userRepository.findByCpf(CPF_PARAM)).thenReturn(Optional.of(user));

        ValidationException exception = assertThrows(ValidationException.class,
                () -> userService.create(createUserDTO));

        assertEquals("CPF já cadastrado", exception.getMessage());
        verify(userRepository, never()).saveAndFlush(any(User.class));
    }

    @Test
    void create_WhenDefaultProfileNotFound_ShouldThrowDefaultProfileNotFoundException() {
        when(userRepository.findByEmail(EMAIL_PARAM)).thenReturn(Optional.empty());
        when(userRepository.findByCpf(CPF_PARAM)).thenReturn(Optional.empty());
        when(perfilService.findByName(Perfil.getDefaultPerfilName())).thenReturn(Optional.empty());

        DefaultProfileNotFoundException exception = assertThrows(DefaultProfileNotFoundException.class,
                () -> userService.create(createUserDTO));

        assertEquals("Perfil padrão não encontrado. Contate o administrador do sistema.", exception.getMessage());
        verify(userRepository, never()).saveAndFlush(any(User.class));
    }

    @Test
    void create_WhenPasswordIsTooShort_ShouldThrowValidationException() {
        CreateUserDTO shortPasswordDTO = new CreateUserDTO(
                EMAIL_PARAM, "123", NAME_PARAM, CPF_PARAM, REGISTRATION_PARAM, PHONE_PARAM, null, ALT_PHONE_PARAM);

        when(userRepository.findByEmail(EMAIL_PARAM)).thenReturn(Optional.empty());
        when(userRepository.findByCpf(CPF_PARAM)).thenReturn(Optional.empty());
        when(perfilService.findByName(Perfil.getDefaultPerfilName())).thenReturn(Optional.of(defaultPerfil));

        ValidationException exception = assertThrows(ValidationException.class,
                () -> userService.create(shortPasswordDTO));

        assertEquals("A senha deve ter no mínimo 8 caracteres", exception.getMessage());
        verify(userRepository, never()).saveAndFlush(any(User.class));
    }

    @Test
    void reviewUserRole_WhenApproved_ShouldUpdateUserRoleAndClearRequestedPerfil() {
        user.setRequestedPerfil(adminPerfil);
        user.setProfileStatus(ProfileStatus.PENDING);

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(adminUser);
        when(userRepository.findByEmailWithPerfilAndPermissions(any())).thenReturn(Optional.of(adminUser));
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));

        userService.reviewUserRole(USER_ID, ProfileStatus.APPROVED);

        assertEquals(adminPerfil, user.getPerfil());
        assertNull(user.getRequestedPerfil());
        assertEquals(ProfileStatus.APPROVED, user.getProfileStatus());
        verify(userRepository).save(user);
    }

    @Test
    void reviewUserRole_WhenRejected_ShouldKeepOldRoleAndClearRequestedPerfil() {
        user.setRequestedPerfil(adminPerfil);
        user.setProfileStatus(ProfileStatus.PENDING);

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(adminUser);
        when(userRepository.findByEmailWithPerfilAndPermissions(any())).thenReturn(Optional.of(adminUser));
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));

        userService.reviewUserRole(USER_ID, ProfileStatus.REJECTED);

        assertEquals(defaultPerfil, user.getPerfil());
        assertNull(user.getRequestedPerfil());
        assertEquals(ProfileStatus.REJECTED, user.getProfileStatus());
        verify(userRepository).save(user);
    }

    @Test
    void reviewUserRole_WhenUserNotAdmin_ShouldThrowUnauthorizedException() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(user);
        when(userRepository.findByEmailWithPerfilAndPermissions(EMAIL_PARAM)).thenReturn(Optional.of(user));

        assertThrows(UnauthorizedException.class, () -> userService.reviewUserRole(USER_ID, ProfileStatus.APPROVED));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void reviewUserRole_WhenStatusIsPending_ShouldThrowBadRequestException() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(adminUser);
        when(userRepository.findByEmailWithPerfilAndPermissions(any())).thenReturn(Optional.of(adminUser));

        assertThrows(BadRequestException.class, () -> userService.reviewUserRole(USER_ID, ProfileStatus.PENDING));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void reviewUserRole_WhenUserHasNoRequestedPerfil_ShouldThrowBadRequestException() {
        user.setRequestedPerfil(null);

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(adminUser);
        when(userRepository.findByEmailWithPerfilAndPermissions(any())).thenReturn(Optional.of(adminUser));
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));

        assertThrows(BadRequestException.class, () -> userService.reviewUserRole(USER_ID, ProfileStatus.APPROVED));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void update_WithAllFields_ShouldUpdateUser() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(user);
        when(userRepository.findByEmailWithPerfilAndPermissions(EMAIL_PARAM)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        User result = userService.update(userUpdateDTO);

        assertNotNull(result);
        assertEquals(userUpdateDTO.getName(), result.getName());
        assertEquals(userUpdateDTO.getRegistrationNumber(), result.getRegistration());
        assertEquals(userUpdateDTO.getPhone(), result.getPhone());
        assertEquals(userUpdateDTO.getAlternativePhone(), result.getAlternativePhone());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void findAll_ShouldReturnAllUsers() {
        when(userRepository.findAll()).thenReturn(userList);

        List<User> result = userService.findAll();

        assertNotNull(result);
        assertEquals(userList.size(), result.size());
        assertEquals(userList, result);
        verify(userRepository).findAll();
    }

    @Test
    void getAllUsersWithPerfilAndPermissions_ShouldReturnAllUsers() {
        when(userRepository.findAllWithPerfilAndPermissions()).thenReturn(userList);

        List<User> result = userService.getAllUsersWithPerfilAndPermissions();

        assertNotNull(result);
        assertEquals(userList.size(), result.size());
        assertEquals(userList, result);
        verify(userRepository).findAllWithPerfilAndPermissions();
    }

    @Test
    void findById_WhenUserExists_ShouldReturnUser() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));

        Optional<User> result = userService.findById(USER_ID);

        assertTrue(result.isPresent());
        assertEquals(user, result.get());
        verify(userRepository).findById(USER_ID);
    }

    @Test
    void findById_WhenUserDoesNotExist_ShouldReturnEmpty() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

        Optional<User> result = userService.findById(USER_ID);

        assertFalse(result.isPresent());
        verify(userRepository).findById(USER_ID);
    }

    @Test
    void findByEmail_WhenUserExists_ShouldReturnUser() {
        when(userRepository.findByEmail(EMAIL_PARAM)).thenReturn(Optional.of(user));

        Optional<User> result = userService.findByEmail(EMAIL_PARAM);

        assertTrue(result.isPresent());
        assertEquals(user, result.get());
        verify(userRepository).findByEmail(EMAIL_PARAM);
    }

    @Test
    void findByEmail_WhenUserDoesNotExist_ShouldReturnEmpty() {
        when(userRepository.findByEmail(EMAIL_PARAM)).thenReturn(Optional.empty());

        Optional<User> result = userService.findByEmail(EMAIL_PARAM);

        assertFalse(result.isPresent());
        verify(userRepository).findByEmail(EMAIL_PARAM);
    }

    @Test
    void delete_WhenNonAdminUser_ShouldThrowException() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(user);
        when(userRepository.findByEmailWithPerfilAndPermissions(EMAIL_PARAM)).thenReturn(Optional.of(user));

        ValidationException exception = assertThrows(ValidationException.class,
                () -> userService.delete("other@example.com"));

        assertEquals("Você não tem permissão para deletar um usuário", exception.getMessage());
        verify(userRepository, never()).delete(any(User.class));
    }

    @Test
    void delete_WhenUserNotFound_ShouldThrowException() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(adminUser);
        when(userRepository.findByEmailWithPerfilAndPermissions(any())).thenReturn(Optional.of(adminUser));
        when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.empty());

        ValidationException exception = assertThrows(ValidationException.class,
                () -> userService.delete("other@example.com"));

        assertEquals("Usuário não encontrado", exception.getMessage());
        verify(userRepository, never()).delete(any(User.class));
    }

    @Test
    void delete_WhenTryingToDeleteSelf_ShouldThrowException() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(adminUser);
        when(userRepository.findByEmailWithPerfilAndPermissions(any())).thenReturn(Optional.of(adminUser));
        when(userRepository.findByEmail(adminUser.getEmail())).thenReturn(Optional.of(adminUser));

        ValidationException exception = assertThrows(ValidationException.class,
                () -> userService.delete(adminUser.getEmail()));

        assertEquals("Você não pode deletar seu próprio usuário", exception.getMessage());
        verify(userRepository, never()).delete(any(User.class));
    }

    @Test
    void delete_WhenTryingToDeleteAdmin_ShouldThrowException() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(adminUser);
        when(userRepository.findByEmailWithPerfilAndPermissions(any())).thenReturn(Optional.of(adminUser));

        User otherAdmin = new User();
        otherAdmin.setEmail("other.admin@example.com");
        otherAdmin.setPerfil(adminPerfil);
        when(userRepository.findByEmail(otherAdmin.getEmail())).thenReturn(Optional.of(otherAdmin));

        ValidationException exception = assertThrows(ValidationException.class,
                () -> userService.delete(otherAdmin.getEmail()));

        assertEquals("Você não pode deletar um usuário administrador", exception.getMessage());
        verify(userRepository, never()).delete(any(User.class));
    }

    @Test
    void delete_WhenUserHasSolicitationRequests_ShouldThrowException() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(adminUser);
        when(userRepository.findByEmailWithPerfilAndPermissions(any())).thenReturn(Optional.of(adminUser));
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(userRequestValidationService.userHasAnySolicitationRequests(anyLong())).thenReturn(true);

        ValidationException exception = assertThrows(ValidationException.class,
                () -> userService.delete(user.getEmail()));

        assertEquals("Você não pode deletar um usuário que possui solicitações de assistência", exception.getMessage());
        verify(userRepository, never()).delete(any(User.class));
    }

    @Test
    void delete_WhenUserHasExtraRequests_ShouldThrowException() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(adminUser);
        when(userRepository.findByEmailWithPerfilAndPermissions(any())).thenReturn(Optional.of(adminUser));
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(userRequestValidationService.userHasAnySolicitationRequests(anyLong())).thenReturn(false);
        when(userRequestValidationService.userHasAnyExtraRequests(anyLong())).thenReturn(true);

        ValidationException exception = assertThrows(ValidationException.class,
                () -> userService.delete(user.getEmail()));

        assertEquals("Você não pode deletar um usuário que possui solicitações de demanda extra",
                exception.getMessage());
        verify(userRepository, never()).delete(any(User.class));
    }

    @Test
    void delete_WhenValidRequest_ShouldDeleteUser() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(adminUser);
        when(userRepository.findByEmailWithPerfilAndPermissions(any())).thenReturn(Optional.of(adminUser));
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(userRequestValidationService.userHasAnySolicitationRequests(anyLong())).thenReturn(false);
        when(userRequestValidationService.userHasAnyExtraRequests(anyLong())).thenReturn(false);

        userService.delete(user.getEmail());

        verify(userRepository).delete(user);
    }

    @Test
    void changePassword_WhenCurrentPasswordIsIncorrect_ShouldThrowException() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(user);
        when(userRepository.findByEmailWithPerfilAndPermissions(EMAIL_PARAM)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        ValidationException exception = assertThrows(ValidationException.class,
                () -> userService.changePassword("wrongpassword", "newpassword"));

        assertEquals("Senha atual incorreta", exception.getMessage());
        verify(userRepository, never()).saveAndFlush(any(User.class));
    }

    @Test
    void changePassword_WhenNewPasswordSameAsOld_ShouldThrowException() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(user);
        when(userRepository.findByEmailWithPerfilAndPermissions(EMAIL_PARAM)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(PASSWORD_PARAM, user.getPassword())).thenReturn(true);

        ValidationException exception = assertThrows(ValidationException.class,
                () -> userService.changePassword(PASSWORD_PARAM, PASSWORD_PARAM));

        assertEquals("A nova senha não pode ser igual a senha atual", exception.getMessage());
        verify(userRepository, never()).saveAndFlush(any(User.class));
    }

    @Test
    void changePassword_WhenValid_ShouldUpdatePassword() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(user);
        when(userRepository.findByEmailWithPerfilAndPermissions(EMAIL_PARAM)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(PASSWORD_PARAM, user.getPassword())).thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenReturn(PASSWORD_ENCODED);

        userService.changePassword(PASSWORD_PARAM, "novasenha123");

        verify(passwordEncoder).encode("novasenha123");
        verify(userRepository).saveAndFlush(user);
    }

    @Test
    void updatePassword_ShouldEncodeAndSavePassword() {
        when(passwordEncoder.encode("novasenha123")).thenReturn(PASSWORD_ENCODED);

        userService.updatePassword(user, "novasenha123");

        assertEquals(PASSWORD_ENCODED, user.getPassword());
        verify(passwordEncoder).encode("novasenha123");
        verify(userRepository).saveAndFlush(user);
    }

    @Test
    void updateProfile_WhenNonAdminUser_ShouldThrowException() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(user);
        when(userRepository.findByEmailWithPerfilAndPermissions(EMAIL_PARAM)).thenReturn(Optional.of(user));

        ValidationException exception = assertThrows(ValidationException.class,
                () -> userService.updateProfile("other@example.com", PROFILE_ID));

        assertEquals("Você não tem permissão para atualizar o perfil de outro usuário", exception.getMessage());
        verify(perfilService, never()).findById(anyLong());
    }

    @Test
    void updateProfile_WhenUserNotFound_ShouldThrowException() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(adminUser);
        when(userRepository.findByEmailWithPerfilAndPermissions(any())).thenReturn(Optional.of(adminUser));
        when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> userService.updateProfile("other@example.com", PROFILE_ID));

        verify(perfilService, never()).findById(anyLong());
    }

    @Test
    void updateProfile_WhenProfileNotFound_ShouldThrowException() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(adminUser);
        when(userRepository.findByEmailWithPerfilAndPermissions(any())).thenReturn(Optional.of(adminUser));
        when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.of(user));
        when(perfilService.findById(PROFILE_ID)).thenReturn(Optional.empty());

        ValidationException exception = assertThrows(ValidationException.class,
                () -> userService.updateProfile("other@example.com", PROFILE_ID));

        assertEquals("Perfil não encontrado", exception.getMessage());
        verify(userRepository, never()).saveAndFlush(any(User.class));
    }

    @Test
    void updateProfile_WhenRemovingOwnAdminRole_ShouldThrowException() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(adminUser);
        when(userRepository.findByEmailWithPerfilAndPermissions(any())).thenReturn(Optional.of(adminUser));
        when(userRepository.findByEmail(adminUser.getEmail())).thenReturn(Optional.of(adminUser));
        when(perfilService.findById(PROFILE_ID)).thenReturn(Optional.of(defaultPerfil));

        ValidationException exception = assertThrows(ValidationException.class,
                () -> userService.updateProfile(adminUser.getEmail(), PROFILE_ID));

        assertEquals("Você não pode remover seu próprio papel de administrador", exception.getMessage());
        verify(userRepository, never()).saveAndFlush(any(User.class));
    }

    @Test
    void updateProfile_WhenValid_ShouldUpdateProfile() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(adminUser);
        when(userRepository.findByEmailWithPerfilAndPermissions(any())).thenReturn(Optional.of(adminUser));
        when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.of(user));
        when(perfilService.findById(PROFILE_ID)).thenReturn(Optional.of(adminPerfil));

        userService.updateProfile("other@example.com", PROFILE_ID);

        assertEquals(adminPerfil, user.getPerfil());
        verify(userRepository).saveAndFlush(user);
    }
}