package br.ufba.proap.authentication.controller;

import br.ufba.proap.authentication.domain.Perfil;
import br.ufba.proap.authentication.domain.User;
import br.ufba.proap.authentication.domain.dto.PerfilRequestDTO;
import br.ufba.proap.authentication.domain.dto.PerfilResponseDTO;
import br.ufba.proap.authentication.service.PerfilService;
import br.ufba.proap.authentication.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.ws.rs.NotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/perfil")
public class PerfilController {

    @Autowired
    private PerfilService perfilService;

    @Autowired
    private UserService userService;

    @PostMapping("/create")
    public ResponseEntity<?> createPerfil(@RequestBody @Valid PerfilRequestDTO perfilDTO) {
        User currentUser = userService.getLoggedUser();

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            PerfilResponseDTO newPerfil = perfilService.createPerfil(perfilDTO, currentUser);
            return ResponseEntity.ok(newPerfil);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePerfil(@PathVariable Long id, @RequestBody @Valid PerfilRequestDTO perfilDTO) {
        User currentUser = userService.getLoggedUser();

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            PerfilResponseDTO updated = perfilService.updatePerfil(id, perfilDTO, currentUser);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (NotFoundException | EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePerfil(@PathVariable Long id) {
        User currentUser = userService.getLoggedUser();

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            perfilService.deletePerfil(id, currentUser);
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erro ao deletar");
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<PerfilResponseDTO>> listAll() {
        List<Perfil> perfis = perfilService.findAll();

        List<PerfilResponseDTO> dtos = perfis.stream()
                .map(perfil -> new PerfilResponseDTO(perfil))
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return perfilService.findById(id)
                .map(perfil -> ResponseEntity.ok(perfil))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}