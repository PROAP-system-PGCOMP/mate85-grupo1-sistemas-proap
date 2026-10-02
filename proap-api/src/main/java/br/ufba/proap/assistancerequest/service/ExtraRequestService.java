package br.ufba.proap.assistancerequest.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import br.ufba.proap.assistancerequest.domain.dto.AssistanceRequestCeapgDTO;
import br.ufba.proap.assistancerequest.domain.dto.CountRequestDTO;
import br.ufba.proap.assistancerequest.domain.dto.ExtraRequestResponseDTO;
import br.ufba.proap.assistancerequest.domain.dto.TotalElementosResponseDTO;
import br.ufba.proap.assistancerequest.domain.enums.StatusCeapg;
import br.ufba.proap.assistancerequest.repository.ExtraRequestQueryRepository;
import br.ufba.proap.authentication.service.UserService;
import br.ufba.proap.exception.UnauthorizedException;
import jakarta.ws.rs.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.ufba.proap.assistancerequest.domain.ExtraRequest;
import br.ufba.proap.assistancerequest.repository.ExtraRequestRepostirory;
import br.ufba.proap.authentication.domain.User;

import jakarta.validation.constraints.NotNull;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;


@Service
public class ExtraRequestService {

	@Autowired
	private ExtraRequestRepostirory extraRequestRepostirory;

	@Autowired
	private ExtraRequestQueryRepository extraRequestQueryRepository;

    @Autowired
    private UserService userService;

	public List<ExtraRequest> findAll() {
		return extraRequestRepostirory.findAll();
	}

	public List<ExtraRequest> findByUser(User user) {
		return extraRequestRepostirory.findByUser(user);
	}

	public Optional<ExtraRequest> findById(Long id) {
		return extraRequestRepostirory.findById(id);
	}

	public ExtraRequest save(ExtraRequest extraRequest) {
		return extraRequestRepostirory.save(extraRequest);
	}

	public void delete(ExtraRequest extraRequest) {
		extraRequestRepostirory.delete(extraRequest);
	}

	public static class ExtraRequestListFiltered {
		public List<ExtraRequestResponseDTO> list;
		public long total;

		public ExtraRequestListFiltered(List<ExtraRequestResponseDTO> list, long total) {
			this.list = list;
			this.total = total;
		}
	}

	/**
	 * Busca os registros de demanda extra usando paginação e ordenação a partir de
	 * uma propriedade
	 * 
	 * @param sortBy    Atributo do objeto ExtraRequest para ordenação
	 * @param ascending Se falso, será por ordem descendente
	 * @param page      Número da página (primeira página como 0)
	 * @param size      Tamanho da página/da lista
	 * @param user      Filtrar por usuário
	 * @return Lista de demandas extras que devem ser exibidas na página
	 */

    @Transactional(readOnly = true)
	public ExtraRequestListFiltered find(
			String sortBy,
			boolean ascending,
			int page,
			int size,
			@NotNull User user) {
		long count;

		boolean userHasPermission = user.getPerfil() != null
				&& user.getPerfil().hasPermission("VIEW_ALL_REQUESTS");

		if (userHasPermission)
			count = extraRequestRepostirory.count();
		else
			count = extraRequestRepostirory.countByUser(user);

		List<ExtraRequest> extraRequests = extraRequestQueryRepository.findFiltered(
						sortBy,
						ascending,
						page,
						size,
						userHasPermission ? null : user);

        List<ExtraRequestResponseDTO> dtos = extraRequests.stream()
                .map(ExtraRequestResponseDTO::new)
                .toList();

        return new ExtraRequestListFiltered(dtos, count);
	}

	public Boolean userHasAnyExtraRequests(Long userId) {
		return extraRequestRepostirory.userHasAnyExtraRequests(userId);
	}


    @Transactional
    public ExtraRequest reviewExtraSolicitation(ExtraRequest requestFromFront, User currentUser) {
    ExtraRequest persisted = extraRequestRepostirory.findById(requestFromFront.getId())
            .orElseThrow(() -> new RuntimeException("Demanda extra não encontrada"));

    persisted.setSituacao(requestFromFront.getSituacao());
    persisted.setObservacao(requestFromFront.getObservacao());
    persisted.setNumeroAta(requestFromFront.getNumeroAta());
    persisted.setValorAprovado(requestFromFront.getValorAprovado());
    
    persisted.setDataAvaliacaoProap(requestFromFront.getDataAvaliacaoProap());

    if (persisted.getSituacao() == 2) {
        persisted.setStatusCeapg(StatusCeapg.NAO_APROVADO);
    }

    persisted.setAutomaticDecText(" ");

    return extraRequestRepostirory.save(persisted);
    }

    @Transactional(readOnly = true)
    public TotalElementosResponseDTO totalExtra(CountRequestDTO data) {
        User currentUser = userService.getLoggedUser();

        if (!currentUser.getPerfil().hasPermission("ADMIN_ROLE")) {
            throw new UnauthorizedException("Usuario não possui autorização");
        }

        TotalElementosResponseDTO total = new TotalElementosResponseDTO(this.extraRequestRepostirory.count(data.startDate(), data.endDate()));

        return total;
    }

    public ExtraRequest updateCeapgFields(Long id, AssistanceRequestCeapgDTO dto) {
        User currentUser = userService.getLoggedUser();

        if (!currentUser.getPerfil().hasPermission("CEAPG_ROLE")) {
            throw new UnauthorizedException("Usuario não possui autorização");
        }

        ExtraRequest request = extraRequestRepostirory.findById(id)
                .orElseThrow(() -> new RuntimeException("Demanda extra não encontrada"));

        if (request.getSituacao() != 1 || request.getSituacao() != 0) {
            throw new BadRequestException("Demanda ainda não aprovada pela comissão");
        }

        request.setCustoFinalCeapg(dto.getCustoFinalCeapg());

        BigDecimal diferenca = dto.getCustoFinalCeapg().subtract(request.getValorAprovado());

        request.setDiferencaCeapg(diferenca);

        if (diferenca.compareTo(BigDecimal.ZERO) > 0) {
            request.setStatusCeapg(StatusCeapg.ACIMA_DO_LIMITE);
        } else if (diferenca.compareTo(BigDecimal.ZERO) < 0) {
            request.setStatusCeapg(StatusCeapg.ABAIXO_DO_LIMITE);
        } else {
           request.setStatusCeapg(StatusCeapg.IGUAL_AO_LIMITE);
        }

        request.setObservacoesCeapg(dto.getObservacoesCeapg());
        request.setDataAvaliacaoCeapg(LocalDate.now());
        request.setAvaliadorCeapg(currentUser);
        return this.extraRequestRepostirory.save(request);
    }
}
