package br.ufba.proap.authentication.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import br.ufba.proap.authentication.domain.Perfil;
import br.ufba.proap.authentication.domain.Permission;
import br.ufba.proap.authentication.domain.User;
import br.ufba.proap.authentication.domain.dto.PerfilRequestDTO;
import br.ufba.proap.authentication.domain.dto.PerfilResponseDTO;
import br.ufba.proap.authentication.repository.PerfilRepository;
import br.ufba.proap.authentication.repository.PermissionRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PerfilService {

	@Autowired
	private PerfilRepository perfilRepository;

    @Autowired
    private PermissionRepository permissionRepository;

	public Perfil create(Perfil userPhoto) {
		return perfilRepository.saveAndFlush(userPhoto);
	}

	public Perfil update(Perfil userPhoto) {
		return perfilRepository.save(userPhoto);
	}

	public List<Perfil> findAll() {
		return perfilRepository.findAll();
	}

	public Optional<Perfil> findById(Long id) {
		return perfilRepository.findById(id);
	}

	public Optional<Perfil> findByName(String name) {
		return perfilRepository.findByName(name);
	}

	public List<Perfil> findByUserId(Long id) {
		return perfilRepository.findByIdUser(id);
	}

	public void remove(Perfil userPhoto) {
		perfilRepository.delete(userPhoto);
	}

    @Transactional
    public PerfilResponseDTO createPerfil(PerfilRequestDTO perfilDTO, User currentUser) {
        if (currentUser.getPerfil() == null || !currentUser.getPerfil().hasPermission("ADMIN_ROLE")) {
            throw new SecurityException("Acesso negado: Permissão insuficiente.");
        }

        Optional<Perfil> perfilExistente = perfilRepository.findByName(perfilDTO.name());
        if (perfilExistente.isPresent()) {
            throw new IllegalArgumentException("Perfil com o nome '" + perfilDTO.name() + "' já existe.");
        }

        Perfil novoPerfil = new Perfil();
        novoPerfil.setName(perfilDTO.name());

        if (perfilDTO.permissionIds() != null) {
            Set<Permission> permissions = perfilDTO.permissionIds().stream()
                    .map(id -> permissionRepository.findById(id)
                            .orElseThrow(() -> new EntityNotFoundException("Permissão ID " + id + " não encontrada")))
                    .collect(Collectors.toSet());
            novoPerfil.setPermissions(permissions);
        }

        Perfil perfilSalvo = perfilRepository.save(novoPerfil);

        return new PerfilResponseDTO(perfilSalvo);
    }

    @Transactional
    public PerfilResponseDTO updatePerfil(Long id, PerfilRequestDTO perfilDTO, User currentUser) {
        if (currentUser.getPerfil() == null || !currentUser.getPerfil().hasPermission("ADMIN_ROLE")) {
            throw new SecurityException("Acesso negado: Permissão insuficiente.");
        }

        Perfil perfilExistente = perfilRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Perfil não encontrado"));

        perfilRepository.findByName(perfilDTO.name())
                .ifPresent(p -> {
                    if (!p.getId().equals(id)) {
                        throw new IllegalArgumentException("Já existe outro perfil com este nome.");
                    }
                });

        perfilExistente.setName(perfilDTO.name());

        if (perfilDTO.permissionIds() != null) {
            Set<Permission> novasPermissoes = perfilDTO.permissionIds().stream()
                    .map(permId -> permissionRepository.findById(permId)
                            .orElseThrow(() -> new EntityNotFoundException("Permissão " + permId + " inválida")))
                    .collect(Collectors.toSet());

            perfilExistente.setPermissions(novasPermissoes);
        }

        return new PerfilResponseDTO(perfilRepository.save(perfilExistente));
    }

    @Transactional
    public void deletePerfil(Long id, User currentUser) {
        if (currentUser.getPerfil() == null || !currentUser.getPerfil().hasPermission("ADMIN_ROLE")) {
            throw new SecurityException("Acesso negado: Permissão insuficiente.");
        }

        Perfil perfil = perfilRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Perfil não encontrado"));

        if ("ADMIN_ROLE".equals(perfil.getName())) {
            throw new RuntimeException("O perfil administrativo principal não pode ser removido.");
        }

        perfilRepository.delete(perfil);
    }
}
