package br.ufba.proap.authentication.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.ufba.proap.authentication.domain.User;
import br.ufba.proap.authentication.domain.dto.ChangePasswordDTO;
import br.ufba.proap.authentication.domain.dto.CreateUserDTO;
import br.ufba.proap.authentication.domain.dto.StatusResponseDTO;
import br.ufba.proap.authentication.domain.dto.UserResponseDTO;
import br.ufba.proap.authentication.domain.dto.UserUpdateDTO;
import br.ufba.proap.authentication.service.UserService;
import br.ufba.proap.exception.DefaultProfileNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.ValidationException;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/user")
public class UserController {

	private static final Logger logger = LoggerFactory.getLogger(UserController.class);

	@Autowired
	private UserService service;

	@PostMapping("/create")
	public ResponseEntity<?> create(@RequestBody @Valid CreateUserDTO user) {
		try {
			service.create(user);
			return ResponseEntity.status(HttpStatus.CREATED)
					.body(new StatusResponseDTO("Sucesso", "Usuário criado com sucesso!"));
		} catch (DefaultProfileNotFoundException e) {
			logger.error(e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new StatusResponseDTO("Conta não criada", e.getMessage()));
		} catch (ValidationException e) {
			logger.error(e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(new StatusResponseDTO("Inválido", e.getMessage()));
		}
	}

	// TODO: Débito técnico - Refatorar para service
	@Transactional
	@GetMapping("/list")
	public ResponseEntity<List<UserResponseDTO>> list() {
		try {
			User currentUser = service.getLoggedUser();
			if (currentUser.getPerfil() == null ||
					!currentUser.getPerfil().hasPermission("VIEW_USER")) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
			}

			List<User> users = service.getAllUsersWithPerfilAndPermissions();
			List<UserResponseDTO> usersDto = users.stream().map(user -> {
				return UserResponseDTO.fromUser(user);
			}).toList();
			return ResponseEntity.ok().body(usersDto);
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	// TODO: Débito técnico - Refatorar para service
	@Transactional
	@GetMapping("/info")
	public ResponseEntity<UserResponseDTO> currentUserInfo() {
		try {
			User currentUser = service.getLoggedUser();
			if (currentUser == null) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
			}
			return ResponseEntity.ok().body(UserResponseDTO.fromUser(currentUser));
		} catch (Exception e) {
			logger.error(e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	// TODO: Débito técnico - Refatorar para service
	@Transactional
	@PutMapping("/update")
	public ResponseEntity<UserResponseDTO> update(@RequestBody @Valid UserUpdateDTO user) {
		try {
			User userService = service.update(user);
			return ResponseEntity.ok().body(UserResponseDTO.fromUser(userService));
		} catch (Exception e) {
			logger.error(e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		}
	}

	@DeleteMapping("/delete/{email}")
	public ResponseEntity<StatusResponseDTO> delete(@PathVariable @Email String email) {
		try {
			service.delete(email);
			return ResponseEntity.ok().body(new StatusResponseDTO("Sucesso", "Usuário deletado com sucesso!"));
		} catch (ValidationException e) {
			logger.error(e.getMessage());
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new StatusResponseDTO("Erro", e.getMessage()));
		}
	}

	@PutMapping("/change-password")
	public ResponseEntity<StatusResponseDTO> changePassword(@Valid @RequestBody ChangePasswordDTO body) {
		try {
			service.changePassword(body.currentPassword(), body.newPassword());
			return ResponseEntity.ok()
					.body(new StatusResponseDTO("Sucesso", "Senha alterada com sucesso!"));
		} catch (ValidationException e) {
			logger.error(e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(new StatusResponseDTO("Inválido", e.getMessage()));
		} catch (Exception e) {
			logger.error(e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new StatusResponseDTO("Erro", "Erro interno no servidor"));
		}
	}

	@PutMapping("/update-profile/{email}")
	public ResponseEntity<StatusResponseDTO> updateProfile(@PathVariable @Email String email,
			@NotNull @RequestParam Long profileId) {
		try {
			service.updateProfile(email, profileId);
			return ResponseEntity.ok().body(new StatusResponseDTO("Sucesso", "Perfil atualizado com sucesso!"));
		} catch (ValidationException e) {
			logger.error(e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(new StatusResponseDTO("Inválido", e.getMessage()));
		} catch (UsernameNotFoundException e) {
			logger.error(e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(new StatusResponseDTO("Inválido", "Usuário não encontrado"));
		}
	}

}
