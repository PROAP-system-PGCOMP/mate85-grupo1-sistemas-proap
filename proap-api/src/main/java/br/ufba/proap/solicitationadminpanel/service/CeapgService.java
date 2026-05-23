package br.ufba.proap.solicitationadminpanel.service;

import br.ufba.proap.assistancerequest.domain.AssistanceRequest;
import br.ufba.proap.authentication.domain.User;
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
                    return new CeapgResponseDTO(id, valorAprovado, dataAvaliacaoProap,
                            avaliadorProap, custoFinalCeapg, observacoesCeapg, avaliadorCeapg, dataAvaliacaoCeapg);
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

        AssistanceRequest novo = AssistenceRequestOptional.get();
        novo.setCustoFinalCeapg(data.valorFinal());
        novo.setObservacoesCeapg(data.observacoes());
        novo.setAvaliadorCeapg(currentUser);
        novo.setDataAvaliacaoCeapg(LocalDate.now());

        return assistanceRequestRepository.save(novo);
    }
}