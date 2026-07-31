package br.ufba.proap.solicitationadminpanel.service;

import br.ufba.proap.assistancerequest.domain.AssistanceRequest;
import br.ufba.proap.assistancerequest.domain.ExtraRequest;
import br.ufba.proap.assistancerequest.domain.dto.ExtraRequestResponseDTO;
import br.ufba.proap.assistancerequest.repository.ExtraRequestRepostirory;
import br.ufba.proap.authentication.domain.User;
import br.ufba.proap.authentication.domain.dto.UserResponseDTO;
import br.ufba.proap.authentication.repository.UserRepository;
import br.ufba.proap.exception.UnauthorizedException;
import br.ufba.proap.solicitationadminpanel.domain.dto.CeapgReviewDTO;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.ufba.proap.assistancerequest.repository.AssistanceRequestRepository;
import br.ufba.proap.solicitationadminpanel.domain.dto.CeapgResponseDTO;
import jakarta.ws.rs.NotFoundException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CeapgService {

    @Autowired
    private AssistanceRequestRepository assistanceRequestRepository;

    @Autowired
    private ExtraRequestRepostirory extraRequestRepostirory;

    @Autowired
    private UserRepository userRepository;

    public List<CeapgResponseDTO> getCeapgRequests(LocalDate startDate, LocalDate endDate) {
        List<Object[]> data = assistanceRequestRepository.findAllCeapgRequests(startDate, endDate);
        if (data.isEmpty())
            throw new NotFoundException("Nenhuma solicitação apta para avaliação pelo CEAPG encontrada");
        return convertPairsToDTOs(data);
    }

    public List<CeapgResponseDTO> getPendingCeapgRequests(LocalDate startDate, LocalDate endDate) {
        List<Object[]> data = assistanceRequestRepository.findAllPendingCeapgRequests(startDate, endDate);
        if (data.isEmpty())
            throw new NotFoundException("Nenhuma solicitação pendente de avaliação pelo CEAPG encontrada");
        return convertPairsToDTOs(data);
    }

    public List<CeapgResponseDTO> getCompletedCeapgRequests(LocalDate startDate, LocalDate endDate) {
        List<Object[]> data = assistanceRequestRepository.findAllCompletedCeapgRequests(startDate, endDate);
        if (data.isEmpty())
            throw new NotFoundException("Nenhuma solicitação avaliada pelo CEAPG encontrada");
        return convertPairsToDTOs(data);
    }

    protected List<CeapgResponseDTO> convertPairsToDTOs(List<Object[]> data) {
        return data.stream()
                .map(objArray -> {
                    Long id = (Long) objArray[0];
                    BigDecimal valorAprovado = (BigDecimal) objArray[1];
                    LocalDate dataAvaliacaoProap = (LocalDate) objArray[2];
                    String avaliadorProap = (String) objArray[3];
                    BigDecimal custoFinalCeapg = (BigDecimal) objArray[4];
                    String observacoesCeapg = (String) objArray[5];
                    String avaliadorCeapg = (String) objArray[6];
                    LocalDate dataAvaliacaoCeapg = (LocalDate) objArray[7];
                    String numeroAta = (String) objArray[8];
                    return new CeapgResponseDTO(id, valorAprovado, dataAvaliacaoProap,
                            avaliadorProap, custoFinalCeapg, observacoesCeapg, avaliadorCeapg, dataAvaliacaoCeapg, numeroAta);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public AssistanceRequest reviewCeapgRequest(Long id, CeapgReviewDTO data, User currentUser){
        if (!currentUser.getPerfil().hasPermission("CEAPG_ROLE") && !currentUser.getPerfil().hasPermission("ADMIN_ROLE")){
            throw new UnauthorizedException("Usuário não tem permissão para revisar solicitações do CEAPG");
        }

        Optional<AssistanceRequest> AssistenceRequestOptional = assistanceRequestRepository.findById(id);
        if (AssistenceRequestOptional.isEmpty()){
            throw new NotFoundException("Solicitação de assistência não encontrada");
        }

        if (AssistenceRequestOptional.get().getSituacao() != 1){
            throw new IllegalArgumentException("A solicitação deve estar aprovada pelo Proap para ser revisada pelo CEAPG");
        }
        if (!currentUser.getId().equals(AssistenceRequestOptional.get().getAvaliadorCeapg().getId())) {
            throw new UnauthorizedException("Usuario não foi designado para fazer a avaliação dessa solicitação");
        }

        AssistanceRequest novo = AssistenceRequestOptional.get();
        novo.setCustoFinalCeapg(data.valorFinal());
        novo.setObservacoesCeapg(data.observacoes());
        novo.setDataAvaliacaoCeapg(LocalDate.now());
        novo.setNumeroAta(data.numeroAta());

        return assistanceRequestRepository.save(novo);
    }

    @Transactional
    public AssistanceRequest defineCeapgAvaliador(Long ceapgAvaliador, User currentUser, Long assistenceId) {
        if (!currentUser.getPerfil().hasPermission("CEAPG_ROLE") && !currentUser.getPerfil().hasPermission("ADMIN_ROLE")) {
            throw new UnauthorizedException("Usuario não tem permissão para definir avaliador para essa solicitação");
        }

        User avaliador = userRepository.findById(ceapgAvaliador)
                .orElseThrow(() -> new NotFoundException("Avaliador não encontrado"));

        if (!avaliador.getPerfil().hasPermission("CEAPG_ROLE") && !currentUser.getPerfil().hasPermission("ADMIN_ROLE")) {
            throw new UnauthorizedException("Usuario não tem autorização CEAPG para realizar a avaliação");
        }

        Optional<AssistanceRequest> assistance = assistanceRequestRepository.findById(assistenceId);
        if (assistance.isEmpty()) {
            throw new NotFoundException("Solicitação de assistência não encontrada");
        }

        AssistanceRequest newAssistance = assistance.get();

        newAssistance.setAvaliadorCeapg(avaliador);

        return assistanceRequestRepository.save(newAssistance);
    }

    @Transactional
    public ExtraRequestResponseDTO defineExtraRequestCeapgAvaliador(Long ceapgAvaliador, User currentUser, Long assistanceId) {
        if (!currentUser.getPerfil().hasPermission("CEAPG_ROLE") && !currentUser.getPerfil().hasPermission("ADMIN_ROLE")) {
            throw new UnauthorizedException("Usuario não tem permissão para definir avaliador para essa solicitação");
        }

        User avaliador = userRepository.findById(ceapgAvaliador)
                .orElseThrow(() -> new NotFoundException("Avaliador não encontrado"));

        if (!avaliador.getPerfil().hasPermission("CEAPG_ROLE") && !avaliador.getPerfil().hasPermission("ADMIN_ROLE")) {
            throw new UnauthorizedException("Usuario não tem autorização CEAPG para realizar a avaliação");
        }

        Optional<ExtraRequest> assistance = extraRequestRepostirory.findById(assistanceId);
        if (assistance.isEmpty()) {
            throw new NotFoundException("Solicitação não encontrada");
        }

        ExtraRequest newAssistance = assistance.get();

        newAssistance.setAvaliadorCeapg(avaliador);

        ExtraRequest saveExtra = this.extraRequestRepostirory.save(newAssistance);

        return new ExtraRequestResponseDTO(saveExtra);
    }

    @Transactional
    public ExtraRequestResponseDTO reviewExtraRequest(Long id, CeapgReviewDTO data, User currentUser) {
        if (!currentUser.getPerfil().hasPermission("CEAPG_ROLE") && !currentUser.getPerfil().hasPermission("ADMIN_ROLE")) {
            throw new UnauthorizedException("Usuario não tem permissão para revisar a solicitação");
        }

        Optional<ExtraRequest> extra = this.extraRequestRepostirory.findById(id);

        if (extra.isEmpty()) {
            throw new NotFoundException("Solicitação extra não encontrada");
        }

        if (extra.get().getSituacao() != 1) {
            throw new IllegalArgumentException("A solicitação não foi aprovada pelo Proap");
        }

        if (!extra.get().getAvaliadorCeapg().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Usuario não possui permissão para realizar essa revisão");
        }

        ExtraRequest saveExtra = extra.get();

        saveExtra.setCustoFinalCeapg(data.valorFinal());
        saveExtra.setNumeroAta(data.numeroAta());
        saveExtra.setDataAvaliacaoCeapg(LocalDate.now());
        saveExtra.setObservacoesCeapg(data.observacoes());

        ExtraRequest newExtra = this.extraRequestRepostirory.save(saveExtra);

        return new ExtraRequestResponseDTO(newExtra);
    }

    public List<UserResponseDTO> findAllCeapg(User currentUser) {
        if (!currentUser.getPerfil().hasPermission("CEAPG_ROLE") && !currentUser.getPerfil().hasPermission("ADMIN_ROLE")) {
            throw new UnauthorizedException("Usuario não tem permissão");
        }

        Long id = 6L;
        return this.userRepository.findAllCeapg(id);
    }
}