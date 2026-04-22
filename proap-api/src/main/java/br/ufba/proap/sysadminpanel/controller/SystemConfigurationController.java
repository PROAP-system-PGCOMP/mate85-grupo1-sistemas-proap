package br.ufba.proap.sysadminpanel.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.ufba.proap.authentication.domain.User;
import br.ufba.proap.authentication.service.UserService;
import br.ufba.proap.sysadminpanel.domain.dto.SystemConfigurationDTO;
import br.ufba.proap.sysadminpanel.domain.dto.UrlMapperDTO;
import br.ufba.proap.sysadminpanel.service.SystemConfigurationService;

@RestController
@RequestMapping("/api/admin/system-config")
public class SystemConfigurationController {

    private static final Logger logger = LoggerFactory.getLogger(SystemConfigurationController.class);

    @Autowired
    private SystemConfigurationService service;

    @Autowired
    private UserService userService;

    @Transactional
    private boolean hasAdminPermission() {
        try {
            User currentUser = userService.getLoggedUser();
            return currentUser.getPerfil() != null &&
                    currentUser.getPerfil().hasPermission("ADMIN_ROLE");
        } catch (Exception e) {
            logger.error("Erro ao verificar permissão: " + e.getMessage(), e);
            return false;
        }
    }

    private <T> ResponseEntity<T> checkAdminPermission() {
        if (!hasAdminPermission()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<SystemConfigurationDTO> getCurrentConfiguration() {
        return ResponseEntity.ok(service.getCurrentConfiguration());
    }

    @PutMapping
    public ResponseEntity<SystemConfigurationDTO> updateConfiguration(@RequestBody SystemConfigurationDTO config) {
        ResponseEntity<SystemConfigurationDTO> permissionCheck = checkAdminPermission();
        if (permissionCheck != null) {
            return permissionCheck;
        }

        return ResponseEntity.ok(service.updateConfiguration(config));
    }

    @PatchMapping
    public ResponseEntity<SystemConfigurationDTO> partialUpdateConfiguration(
            @RequestBody SystemConfigurationDTO config) {
        ResponseEntity<SystemConfigurationDTO> permissionCheck = checkAdminPermission();
        if (permissionCheck != null) {
            return permissionCheck;
        }

        return ResponseEntity.ok(service.updateConfiguration(config));
    }

    @GetMapping("/qualis")
    public ResponseEntity<List<String>> getQualisList() {
        return ResponseEntity.ok(service.getCurrentConfiguration().getQualis());
    }

    @PostMapping("/qualis")
    public ResponseEntity<List<String>> updateQualisList(@RequestBody List<String> qualisList) {
        ResponseEntity<List<String>> permissionCheck = checkAdminPermission();
        if (permissionCheck != null) {
            return permissionCheck;
        }

        return ResponseEntity.ok(service.updateQualisList(qualisList));
    }

    @GetMapping("/resource-links")
    public ResponseEntity<List<UrlMapperDTO>> getResourceLinks() {
        return ResponseEntity.ok(service.getCurrentConfiguration().getResourceLinks());
    }

    @PostMapping("/resource-links")
    public ResponseEntity<List<UrlMapperDTO>> updateResourceLinks(@RequestBody List<UrlMapperDTO> resourceLinks) {
        ResponseEntity<List<UrlMapperDTO>> permissionCheck = checkAdminPermission();
        if (permissionCheck != null) {
            return permissionCheck;
        }

        return ResponseEntity.ok(service.updateResourceLinks(resourceLinks));
    }
}