package br.ufba.proap.authentication.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.ws.rs.NotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.ufba.proap.authentication.domain.dto.LoginDTO;
import br.ufba.proap.authentication.domain.dto.NewPasswordDTO;
import br.ufba.proap.authentication.domain.dto.StatusResponseDTO;
import br.ufba.proap.authentication.service.PasswordResetTokenService;
import br.ufba.proap.security.JwtAuthenticationResponse;
import br.ufba.proap.security.JwtTokenProvider;

@RestController
@RequestMapping("/api/authentication")
public class AuthenticationController {

	@Autowired
	private AuthenticationManager authenticationManager;

	@Autowired
	private JwtTokenProvider tokenProvider;

	@Autowired
	private PasswordResetTokenService passwordResetTokenService;

	@PostMapping("/signin")
	public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginDTO loginInfo) {
		try {
			Authentication authentication = authenticationManager
					.authenticate(
							new UsernamePasswordAuthenticationToken(loginInfo.getUsername(), loginInfo.getPassword()));

			SecurityContextHolder.getContext().setAuthentication(authentication);
			String jwt = tokenProvider.generateToken(authentication);

			return ResponseEntity.ok().body(new JwtAuthenticationResponse(jwt));
		} catch (AuthenticationException e) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new StatusResponseDTO("Erro", e.getMessage()));
		}
	}

	@PostMapping("/reset-password")
	public ResponseEntity<StatusResponseDTO> resetPassword(
			@RequestParam @Email(message = "Email inválido") String email) {
		try {
			passwordResetTokenService.sendResetToken(email);
			return ResponseEntity.ok().body(new StatusResponseDTO("Sucesso", "Token enviado com sucesso"));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(new StatusResponseDTO("erro", e.getMessage()));
		}
	}

	@GetMapping("/reset-password/validate")
	public ResponseEntity<StatusResponseDTO> validateToken(@RequestParam @NotBlank String token) {
		try {
			Boolean validatedStatus = passwordResetTokenService.isPasswordResetTokenValid(token);
			if (!validatedStatus) {
				return ResponseEntity.badRequest().body(new StatusResponseDTO("Erro", "Token inválido"));
			}
			return ResponseEntity.ok().body(new StatusResponseDTO("Sucesso", "Token válido"));
		} catch (NotFoundException e) {
			return ResponseEntity.badRequest().body(new StatusResponseDTO("Erro", e.getMessage()));

		}
	}

	@PostMapping("/reset-password/confirm")
	public ResponseEntity<StatusResponseDTO> recoverPassword(@NotBlank @RequestParam String token,
			@Valid @RequestBody NewPasswordDTO body) {
		String newPassword = body.newPassword();
		try {
			Boolean validatedStatus = passwordResetTokenService.isPasswordResetTokenValid(token);
			if (!validatedStatus) {
				return ResponseEntity.badRequest().body(new StatusResponseDTO("Erro", "Token inválido"));
			}
			passwordResetTokenService.updatePassword(token, newPassword);
			passwordResetTokenService.deleteToken(token);
			return ResponseEntity.ok().body(new StatusResponseDTO("Sucesso", "Senha alterada com sucesso"));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(new StatusResponseDTO("Erro", e.getMessage()));
		}
	}

}
