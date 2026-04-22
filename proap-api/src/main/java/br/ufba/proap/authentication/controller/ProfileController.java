package br.ufba.proap.authentication.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.ufba.proap.authentication.domain.Perfil;
import br.ufba.proap.authentication.domain.User;
import br.ufba.proap.authentication.domain.dto.ProfileDTO;
import br.ufba.proap.authentication.service.PerfilService;
import br.ufba.proap.authentication.service.UserService;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

        @Autowired
        private PerfilService perfilService;
        @Autowired
        private UserService userService;

        @Transactional
        @GetMapping("/user-permissions")
        public ResponseEntity<List<ProfileDTO>> getProfileByName() {
                String currentPerfilLogged = userService.getLoggedUser().getPerfil().getName();
                Perfil perfil = perfilService.findByName(currentPerfilLogged).orElse(null);
                List<ProfileDTO> perfisDTO = perfil != null ? List.of(new ProfileDTO(
                                perfil.getId(),
                                perfil.getName(),
                                perfil.getPermissions().stream()
                                                .map(permission -> permission.getKey()).toList()))
                                : List.of();
                return ResponseEntity.ok(perfisDTO);
        }

        @Transactional
        @GetMapping("/list")
        public ResponseEntity<List<ProfileDTO>> getAll() {
                User currentUser = userService.getLoggedUser();
                if (currentUser.getPerfil() == null ||
                                !currentUser.getPerfil().hasPermission("ADMIN_ROLE")) {
                        return ResponseEntity.status(403).build();
                }
                List<Perfil> perfis = perfilService.findAll();
                List<ProfileDTO> perfisDTO = perfis.stream()
                                .map(perfil -> new ProfileDTO(
                                                perfil.getId(),
                                                perfil.getName(),
                                                perfil.getPermissions().stream()
                                                                .map(permission -> permission.getKey()).toList()))
                                .toList();
                return ResponseEntity.ok(perfisDTO);
        }
}
