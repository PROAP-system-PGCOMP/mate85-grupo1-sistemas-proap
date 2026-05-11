package br.ufba.proap.authentication.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.ufba.proap.authentication.domain.dto.AdminUserRegistrationDTO;
import br.ufba.proap.authentication.domain.dto.StatusResponseDTO;
import br.ufba.proap.authentication.service.UserService;
import br.ufba.proap.exception.DefaultProfileNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.ValidationException;

@RestController
@RequestMapping("api/admin/users")
public class AdminUserController {

    @Autowired
    private UserService userService;

    @PostMapping("/createByAdmin")
    public ResponseEntity<?> createByAdmin(@RequestBody @Valid AdminUserRegistrationDTO user) {
        try {
            userService.createByAdmin(user);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new StatusResponseDTO("Sucesso", "Usuário criado com sucesso!"));
        } catch (DefaultProfileNotFoundException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new StatusResponseDTO("Conta não criada", e.getMessage()));
        } catch (ValidationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new StatusResponseDTO("Inválido", e.getMessage()));
        }
    }
}