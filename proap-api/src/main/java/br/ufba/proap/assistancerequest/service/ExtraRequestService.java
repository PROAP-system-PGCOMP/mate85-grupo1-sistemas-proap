package br.ufba.proap.assistancerequest.service;

import java.util.List;
import java.util.Optional;

import br.ufba.proap.assistancerequest.repository.ExtraRequestQueryRepository;
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
		public List<ExtraRequest> list;
		public long total;

		public ExtraRequestListFiltered(List<ExtraRequest> list, long total) {
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

		return new ExtraRequestListFiltered(
				extraRequestQueryRepository.findFiltered(
						sortBy,
						ascending,
						page,
						size,
						userHasPermission ? null : user),
				count);
	}

	public Boolean userHasAnyExtraRequests(Long userId) {
		return extraRequestRepostirory.userHasAnyExtraRequests(userId);
	}


    @Transactional
    public ExtraRequest reviewExtraSolicitation(ExtraRequest requestFromFront, User currentUser) {
        // 1. Buscamos o registro ORIGINAL da tabela proap_extra_request
        ExtraRequest persisted = extraRequestRepostirory.findById(requestFromFront.getId())
                .orElseThrow(() -> new RuntimeException("Demanda extra não encontrada"));

        // 2. Atualizamos APENAS os campos da EXTRA
        persisted.setSituacao(requestFromFront.getSituacao());
        persisted.setObservacao(requestFromFront.getObservacao());
        persisted.setNumeroAta(requestFromFront.getNumeroAta());
        persisted.setValorAprovado(requestFromFront.getValorAprovado());
        persisted.setDataAvaliacaoProap(LocalDate.now());

        // 3. Geramos o texto automático (o seu método da extra pede uma String)
        persisted.setAutomaticDecText(" ");

        // 4. Forçamos o salvamento
        return extraRequestRepostirory.save(persisted);
    }
}
