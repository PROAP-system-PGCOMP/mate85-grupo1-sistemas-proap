package br.ufba.proap.assistancerequest.controller;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import br.ufba.proap.assistancerequest.domain.dto.CreateExtraRequestDTO;
import br.ufba.proap.assistancerequest.domain.dto.ExtraRequestResponseDTO;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.ufba.proap.assistancerequest.domain.ExtraRequest;
import br.ufba.proap.assistancerequest.domain.Review;
import br.ufba.proap.assistancerequest.domain.dto.ReviewDTO;
import br.ufba.proap.assistancerequest.service.ExtraRequestService;
import br.ufba.proap.assistancerequest.service.ExtraRequestService.ExtraRequestListFiltered;
import br.ufba.proap.assistancerequest.service.ReviewService;
import br.ufba.proap.authentication.domain.User;
import br.ufba.proap.authentication.service.UserService;

@RestController
@RequestMapping("/api/extrarequest")
public class ExtraRequestController {

    private static final Logger logger = LoggerFactory.getLogger(ExtraRequestController.class);

    @Autowired
    private ExtraRequestService service;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserService serviceUser;

    @GetMapping("/list")
    public ResponseEntity<ExtraRequestListFiltered> list(
            @RequestParam String sortBy,
            @RequestParam Boolean ascending,
            @RequestParam int page,
            @RequestParam int size) {
        User currentUser = serviceUser.getLoggedUser();

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    new ExtraRequestListFiltered(
                            Collections.emptyList(), 0));
        }

        try {
            return ResponseEntity.ok().body(
                    service.find(
                            sortBy,
                            ascending,
                            page,
                            size,
                            currentUser));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    new ExtraRequestListFiltered(
                            Collections.emptyList(), 0));
        }
    }

    @GetMapping("/list/{userId}")
    public List<ExtraRequest> listById(@PathVariable Long userId) {
        User currentUser = serviceUser.getLoggedUser();

        if (currentUser == null)
            return Collections.emptyList();
        /*
         * if(!currentUser.getId().equals(userId))
         * return Collections.emptyList();
         */
        try {
            return service.findByUser(currentUser);
        } catch (Exception e) {
            logger.error(e.getMessage());
            return Collections.emptyList();
        }
    }

    @GetMapping("/find/{id}")
    public ResponseEntity<ExtraRequestResponseDTO> findById(@PathVariable Long id) {
        User currentUser = serviceUser.getLoggedUser();

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<ExtraRequest> requestOpt = service.findById(id);

        if (requestOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        ExtraRequest request = requestOpt.get();

        // Lógica de Permissão Corrigida:
        // 1. Se for Admin/Avaliador, ele PODE ver (hasPermission)
        // 2. Se for o dono da solicitação, ele PODE ver
        boolean isOwner = request.getUser().getId().equals(currentUser.getId());
        boolean canViewAll = currentUser.getPerfil() != null &&
                currentUser.getPerfil().hasPermission("VIEW_ALL_REQUESTS");

        if (canViewAll || isOwner) {
            return ResponseEntity.ok(new ExtraRequestResponseDTO(
                    request.getId(),
                    request.getUser().getName(),
                    request.getUser().getEmail(),
                    request.getTitulo(),
                    request.getItemSolicitado(),
                    request.getJustificativa(),
                    request.getValorSolicitado(),
                    request.getSolicitacaoApoio(),
                    request.getSolicitacaoAuxilioOutrasFontes(),
                    request.getNomeSolicitacao(),
                    request.getNomeAgenciaFomento(),
                    request.getValorSolicitadoAgenciaFormento(),
                    request.getCreatedAt(),
                    request.getSituacao(),
                    request.getNumeroAta(),
                    request.getDataAvaliacaoProap(),
                    request.getValorAprovado(),
                    request.getObservacao(),
                    request.getAutomaticDecText()
            ));
        }

        // Se não for dono nem admin, bloqueia
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PostMapping("/create")
    public ResponseEntity<ExtraRequestResponseDTO> create(@Valid @RequestBody CreateExtraRequestDTO dto) {
        User currentUser = serviceUser.getLoggedUser();

        if (currentUser == null)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        try {

            ExtraRequest extraRequest = dto.toEntity();
            extraRequest.setSituacao(0);
            extraRequest.setUser(currentUser);

            ExtraRequest savedExtra = service.save(extraRequest);

            return ResponseEntity.ok(new ExtraRequestResponseDTO(savedExtra));
        } catch (Exception e) {
            logger.error(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/update")
    public ResponseEntity<ExtraRequestResponseDTO> update(@RequestBody ExtraRequest extraRequestAtualizado) {
        try {
            ExtraRequest existente = service.findById(extraRequestAtualizado.getId())
                    .orElseThrow(() -> new RuntimeException("Solicitação não encontrada"));

            existente.setTitulo(extraRequestAtualizado.getTitulo());
            existente.setItemSolicitado(extraRequestAtualizado.getItemSolicitado());
            existente.setJustificativa(extraRequestAtualizado.getJustificativa());
            existente.setValorSolicitado(extraRequestAtualizado.getValorSolicitado());
            existente.setSolicitacaoApoio(extraRequestAtualizado.getSolicitacaoApoio());
            existente.setSolicitacaoAuxilioOutrasFontes(extraRequestAtualizado.getSolicitacaoAuxilioOutrasFontes());
            existente.setNomeSolicitacao(extraRequestAtualizado.getNomeSolicitacao());
            existente.setNomeAgenciaFomento(extraRequestAtualizado.getNomeAgenciaFomento());
            existente.setValorSolicitadoAgenciaFormento(extraRequestAtualizado.getValorSolicitadoAgenciaFormento());

            ExtraRequest savedExtra = service.save(existente);

            return ResponseEntity.ok(new ExtraRequestResponseDTO(savedExtra));

        } catch (Exception e) {
            logger.error("Erro ao atualizar solicitação: ", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<String> remove(@PathVariable Long id) {
        User currentUser = serviceUser.getLoggedUser();

        if (currentUser == null)
            return ResponseEntity.badRequest().build();

        try {
            Optional<ExtraRequest> extraRequest = service.findById(id);

            if (extraRequest.isPresent()) {
                service.delete(extraRequest.get());
                return ResponseEntity.ok().body("Successfully removed");
            }

            return ResponseEntity.notFound().build();

        } catch (Exception e) {
            logger.error(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/extrareviewsolicitation")
    public ResponseEntity<ExtraRequest> reviewextrasolicitation(@RequestBody ExtraRequest extraRequest) {
        User currentUser = serviceUser.getLoggedUser();

        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build(); // 401: Quem é você?
        }

        if (currentUser == null || currentUser.getPerfil() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (!currentUser.getPerfil().hasPermission("APPROVE_REQUEST")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            extraRequest.setAutomaticDecText(" ");

            return ResponseEntity.ok().body(service.reviewExtraSolicitation(extraRequest, currentUser));
        } catch (Exception e) {
            logger.error(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // TODO : Pendencia tecnica: Resolver este método de aprovação que não está
    // sendo utilizado
    @PutMapping("/approve/{requestId}")
    public ResponseEntity<Review> approveRequest(@PathVariable String requestId, @RequestBody ReviewDTO reviewDTO) {
        User currentUser = serviceUser.getLoggedUser();

        if (currentUser == null)
            return ResponseEntity.badRequest().build();

        try {
            return ResponseEntity.ok().body(reviewService.approve(reviewDTO));
        } catch (Exception e) {
            logger.error(e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // TODO : Pendencia tecnica: Resolver este método de aprovação que não está
    // sendo utilizado
    @PutMapping("/reprove/{requestId}")
    public ResponseEntity<Review> reproveRequest(@PathVariable String requestId, @RequestBody ReviewDTO reviewDTO) {
        User currentUser = serviceUser.getLoggedUser();

        if (currentUser == null)
            return ResponseEntity.badRequest().build();

        try {
            return ResponseEntity.ok().body(reviewService.reprove(reviewDTO));
        } catch (Exception e) {
            logger.error(e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

}