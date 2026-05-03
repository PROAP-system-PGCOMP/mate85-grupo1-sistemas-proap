package br.ufba.proap.authentication.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import br.ufba.proap.authentication.domain.dto.AdminUserRegistrationDTO;
import br.ufba.proap.mailsender.event.PasswordResetTokenEvent;
import br.ufba.proap.mailsender.event.UserRegisteredByAdminEvent;
import org.springframework.context.annotation.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.ufba.proap.authentication.domain.Perfil;
import br.ufba.proap.authentication.domain.User;
import br.ufba.proap.authentication.domain.dto.CreateUserDTO;
import br.ufba.proap.authentication.domain.dto.UserUpdateDTO;
import br.ufba.proap.authentication.repository.UserRepository;
import br.ufba.proap.exception.DefaultProfileNotFoundException;
import br.ufba.proap.authentication.service.CreatedByAdmin;
import jakarta.validation.ValidationException;

@Service
public class UserService implements UserDetailsService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PerfilService perfilService;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private UserRequestValidationService userRequestValidationService;

    @Autowired
    private PasswordResetTokenService passwordResetTokenService;

    @Autowired
    private CreatedByAdmin createdByAdmin;

    @Autowired
    public void setPasswordResetTokenService(@Lazy PasswordResetTokenService passwordResetTokenService) {
        this.passwordResetTokenService = passwordResetTokenService;
    }

    @Autowired
    private ApplicationEventPublisher eventPublisher;

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		Optional<User> user = userRepository.findByEmailWithPerfilAndPermissions(email);

		if (!user.isPresent()) {
			throw new UsernameNotFoundException("Email user: " + email + " not found");
		}
		return user.get();
	}

	public User getLoggedUser() {
		String username = "";
		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

		if (principal instanceof UserDetails) {
			username = ((UserDetails) principal).getUsername();
		} else {
			username = principal.toString();
		}

		return (User) this.loadUserByUsername(username);
	}

	public void create(CreateUserDTO user) {
		if (userRepository.findByEmail(user.email()).isPresent()) {
			throw new ValidationException("Email já cadastrado");
		}
		if (userRepository.findByCpf(user.cpf()).isPresent()) {
			throw new ValidationException("CPF já cadastrado");
		}

		Perfil defaultPerfil = perfilService.findByName(Perfil.getDefaultPerfilName()).orElseThrow(
				() -> new DefaultProfileNotFoundException(
						"Perfil padrão não encontrado. Contate o administrador do sistema."));
		if (user.password().length() < 8) {
			throw new ValidationException("A senha deve ter no mínimo 8 caracteres");
		}
		User newUser = new User();
		newUser.setEmail(user.email());
		newUser.setName(user.name());
		newUser.setCpf(user.cpf());
		newUser.setRegistration(user.registration());
		newUser.setPhone(user.phone());
		newUser.setAlternativePhone(user.alternativePhone());
		newUser.setPerfil(defaultPerfil);
		newUser.setPassword(passwordEncoder.encode(user.password()));
		userRepository.saveAndFlush(newUser);
	}

	public User update(UserUpdateDTO user) {
		User loggedUser = getLoggedUser();

		if (user.getName() != null && !user.getName().isEmpty()) {
			loggedUser.setName(user.getName());
		}
		if (user.getRegistrationNumber() != null && !user.getRegistrationNumber().isEmpty()) {
			loggedUser.setRegistration(user.getRegistrationNumber());
		}
		if (user.getPhone() != null && !user.getPhone().isEmpty()) {
			loggedUser.setPhone(user.getPhone());
		}
		if (user.getAlternativePhone() != null) {
			loggedUser.setAlternativePhone(user.getAlternativePhone());
		}
		return userRepository.save(loggedUser);
	}

	public List<User> findAll() {
		return userRepository.findAll();
	}

	public List<User> getAllUsersWithPerfilAndPermissions() {
		return userRepository.findAllWithPerfilAndPermissions();
	}

	public Optional<User> findById(Long id) {
		return userRepository.findById(id);
	}

	public Optional<User> findByEmail(String email) {
		return userRepository.findByEmail(email);
	}

	@Transactional
	public void delete(String email) {
		User loggedUser = getLoggedUser();
		if (!loggedUser.getPerfil().hasPermission("ADMIN_ROLE")) {
			throw new ValidationException("Você não tem permissão para deletar um usuário");
		}
		User user = this.findByEmail(email).orElseThrow(() -> new ValidationException("Usuário não encontrado"));
		if (loggedUser.equals(user)) {
			throw new ValidationException("Você não pode deletar seu próprio usuário");
		}
		if (user.getPerfil().hasPermission("ADMIN_ROLE")) {
			throw new ValidationException("Você não pode deletar um usuário administrador");
		}

		if (userRequestValidationService.userHasAnySolicitationRequests(user.getId())) {
			throw new ValidationException("Você não pode deletar um usuário que possui solicitações de assistência");
		}
		if (userRequestValidationService.userHasAnyExtraRequests(user.getId())) {
			throw new ValidationException("Você não pode deletar um usuário que possui solicitações de demanda extra");
		}

		userRepository.delete(user);
	}

	@Transactional
	public void changePassword(String currentPassword, String newPassword) throws ValidationException {
		User loggedUser = getLoggedUser();
		if (!passwordEncoder.matches(currentPassword, loggedUser.getPassword())) {
			throw new ValidationException("Senha atual incorreta");
		}
		if (currentPassword.equals(newPassword)) {
			throw new ValidationException("A nova senha não pode ser igual a senha atual");
		}
		this.updatePassword(loggedUser, newPassword);

	}

	public void updatePassword(User user, String password) {
		user.setPassword(passwordEncoder.encode(password));
		userRepository.saveAndFlush(user);
	}

	@Transactional
	public void updateProfile(String email, Long profileId) {
		User loggedUser = getLoggedUser();
		if (!loggedUser.getPerfil().hasPermission("ADMIN_ROLE")) {
			throw new ValidationException("Você não tem permissão para atualizar o perfil de outro usuário");
		}
		User targetUser = this.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
		Perfil targetProfile = perfilService.findById(profileId)
				.orElseThrow(() -> new ValidationException("Perfil não encontrado"));

		if (loggedUser.equals(targetUser) && !targetProfile.hasPermission("ADMIN_ROLE")) {
			throw new ValidationException("Você não pode remover seu próprio papel de administrador");
		}
		targetUser.setPerfil(targetProfile);
		userRepository.saveAndFlush(targetUser);
	}

    @Transactional
    public void createByAdmin(AdminUserRegistrationDTO user) {
        if (userRepository.findByEmail(user.email()).isPresent()) {
            throw new ValidationException("Email já cadastrado");
        }
        if (userRepository.findByCpf(user.cpf()).isPresent()) {
            throw new ValidationException("CPF já cadastrado");
        }

        User newUser = new User();
        newUser.setEmail(user.email());
        newUser.setName(user.name());
        newUser.setCpf(user.cpf());
        newUser.setRegistration(user.registration());
        newUser.setPhone(user.phone());
        newUser.setAlternativePhone(user.alternativePhone());
        String defaultPassword = UUID.randomUUID().toString().substring(0, 8);
        newUser.setPassword(passwordEncoder.encode(defaultPassword));
        userRepository.save(newUser);
        String token = createdByAdmin.createCreatedByAdminToken(newUser.getEmail());
        eventPublisher.publishEvent(new UserRegisteredByAdminEvent(newUser.getEmail(), token));
    }
}