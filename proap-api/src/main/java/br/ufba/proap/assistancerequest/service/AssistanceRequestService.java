package br.ufba.proap.assistancerequest.service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.ufba.proap.assistancerequest.domain.AssistanceRequest;
import br.ufba.proap.assistancerequest.domain.dto.AssistanceRequestCeapgDTO;
import br.ufba.proap.assistancerequest.domain.dto.ResponseAssistanceRequestDTO;
import br.ufba.proap.assistancerequest.repository.AssistanceRequestQueryRepository;
import br.ufba.proap.assistancerequest.repository.AssistanceRequestRepository;
import br.ufba.proap.authentication.domain.User;
import br.ufba.proap.authentication.service.UserService;
import br.ufba.proap.exception.UnauthorizedException;
import jakarta.ws.rs.NotFoundException;

@Service
public class AssistanceRequestService {

	@Autowired
	private AssistanceRequestRepository assistanteRequestRepository;

	@Autowired
	private AssistanceRequestQueryRepository assistanceRequestQueryRepository;

	@Autowired
	private UserService userService;

	public List<ResponseAssistanceRequestDTO> findAll() {
		List<AssistanceRequest> assistanceRequest = assistanteRequestRepository.findAll();

		return assistanceRequest.stream().map((ar) -> {
			return ResponseAssistanceRequestDTO.fromEntity(ar);
		}).toList();
	}

	public List<AssistanceRequest> findByUser(User user) {
		return assistanteRequestRepository.findByUser(user);
	}

	@Transactional
	public Optional<ResponseAssistanceRequestDTO> findById(Long id) {
		User currentUser = userService.getLoggedUser();

		Optional<AssistanceRequest> request = assistanteRequestRepository.findById(id);
		if (!request.isPresent())
			return Optional.empty();

		boolean currentUserHasPermission = currentUser.getPerfil() != null && currentUser.getPerfil()
				.hasPermission("VIEW_ALL_REQUESTS");

		if (request.get().getUser().equals(currentUser) || currentUserHasPermission) {
			return Optional.of(ResponseAssistanceRequestDTO.fromEntity(request.get()));
		}

		return Optional.empty();
	}

	public static class AssistanceRequestListFiltered {
		public List<ResponseAssistanceRequestDTO> list;
		public long total;

		public AssistanceRequestListFiltered(List<ResponseAssistanceRequestDTO> list,
				long total) {
			this.list = list;
			this.total = total;
		}

		public static AssistanceRequestListFiltered fromEntity(List<AssistanceRequest> list, long total) {
			return new AssistanceRequestListFiltered(
					list.stream().map((ar) -> {
						return ResponseAssistanceRequestDTO.fromEntity(ar);
					}).toList(),
					total);
		}

	}

	/**
	 * Busca os registros de assistência usando paginação e ordenação a partir de
	 * uma propriedade
	 * 
	 * @param sortBy          Atributo do objeto AssistanceRequest para ordenação
	 * @param ascending       Se falso, será por ordem descendente
	 * @param page            Número da página (primeira página como 0)
	 * @param requestListSize Tamanho da página/da lista
	 * @param user            Filtrar por usuário
	 * @return Lista de assistâncias que devem ser exibidas na página
	 */
	public AssistanceRequestListFiltered find(
			String sortBy,
			boolean ascending,
			int page,
			int requestListSize,
			User user) {
		long count;

		boolean userHasPermission = user.getPerfil() != null
				&& user.getPerfil().hasPermission("VIEW_ALL_REQUESTS");

		if (userHasPermission)
			count = assistanteRequestRepository.count();
		else
			count = assistanteRequestRepository.countByUser(user);

		return AssistanceRequestListFiltered.fromEntity(
				assistanceRequestQueryRepository.findFiltered(
						sortBy,
						ascending,
						page,
						requestListSize,
						userHasPermission ? null : user),
				count);
	}

	public AssistanceRequest save(AssistanceRequest assistanceReques) {
		return assistanteRequestRepository.save(assistanceReques);
	}

	@Transactional
	public void delete(Long id) {
		User currentUser = userService.getLoggedUser();

		AssistanceRequest existentRequest = assistanteRequestRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Solicitação não encontrada"));

		if (!existentRequest.getUser().equals(currentUser)
				&& !currentUser.getPerfil().hasPermission("APPROVE_REQUEST")) {
			throw new UnauthorizedException("Usuário não autorizado a deletar essa solicitação");
		}
		if (existentRequest.getUser().equals(currentUser) && existentRequest.getSituacao() != 0) {
			throw new UnauthorizedException("Usuário não pode deletar uma solicitação já aprovada ou reprovada");
		}

		assistanteRequestRepository.delete(existentRequest);
	}

	@Transactional
	public AssistanceRequest reviewSolicitation(AssistanceRequest assistanceRequest, User currentUser) {
		Optional<AssistanceRequest> assistancePersisted = assistanteRequestRepository
				.findById(assistanceRequest.getId());

		if (!assistancePersisted.isPresent()) {
			return null;
		}

		// Validate situation value
		Integer situacao = assistanceRequest.getSituacao();
		if (situacao == null || (situacao != 1 && situacao != 2 && situacao != 0 && situacao != 3 && situacao != 4)) {
			throw new IllegalArgumentException("Situação deve ser Aprovado, Reprovado, Em espera ou Cancelado");
		}

		AssistanceRequest persisted = assistancePersisted.get();
		persisted.setSituacao(assistanceRequest.getSituacao());
		persisted.setNumeroAta(assistanceRequest.getNumeroAta());

		if (assistanceRequest.getDataAvaliacaoProap() != null) {
			persisted.setDataAvaliacaoProap(assistanceRequest.getDataAvaliacaoProap());
		} else {
			persisted.setDataAvaliacaoProap(LocalDate.now());
		}

		persisted.setNumeroDiariasAprovadas(assistanceRequest.getNumeroDiariasAprovadas());
		persisted.setValorAprovado(assistanceRequest.getValorAprovado());
		persisted.setObservacao(assistanceRequest.getObservacao());
		persisted.setAutomaticDecText();
		persisted.setAvaliadorProap(currentUser);

		return save(persisted);
	}

	@Transactional
	public AssistanceRequest updateCeapgFields(Long id, AssistanceRequestCeapgDTO ceapgDTO)
			throws UnauthorizedException, NotFoundException {
		User currentUser = userService.getLoggedUser();

		if (!currentUser.getPerfil().hasPermission("CEAPG_ROLE")) {
			throw new UnauthorizedException("Usuário não possui permissão para atualizar campos CEAPG");
		}

		AssistanceRequest request = assistanteRequestRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("Solicitação não encontrada"));

		if (!request.getSituacao().equals(1)) {
			throw new UnauthorizedException("Solicitação não foi aprovada pela comissão do PROAP");
		}

		request.setCustoFinalCeapg(ceapgDTO.getCustoFinalCeapg());
		request.setObservacoesCeapg(ceapgDTO.getObservacoesCeapg());
		request.setDataAvaliacaoCeapg(LocalDate.now());
		request.setAvaliadorCeapg(currentUser);
		return assistanteRequestRepository.save(request);
	}

	public Boolean userHasAnySolicitationRequests(Long userId) {
		return assistanteRequestRepository.userHasAnySolicitationRequests(userId);
	}
}
