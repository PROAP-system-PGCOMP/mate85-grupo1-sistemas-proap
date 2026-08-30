package br.ufba.proap.assistancerequest.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import br.ufba.proap.assistancerequest.repository.ExtraRequestRepostirory;
import br.ufba.proap.solicitationadminpanel.service.BudgetService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import br.ufba.proap.assistancerequest.domain.AssistanceRequest;
import br.ufba.proap.assistancerequest.repository.AssistanceRequestQueryRepository;
import br.ufba.proap.assistancerequest.repository.AssistanceRequestRepository;
import br.ufba.proap.authentication.domain.Perfil;
import br.ufba.proap.authentication.domain.Permission;
import br.ufba.proap.authentication.domain.User;
import br.ufba.proap.authentication.service.UserService;

class AssistanceRequestServiceTest {

    @Mock
    private AssistanceRequestRepository repo;
    @Mock
    private AssistanceRequestQueryRepository queryRepo;
    @Mock
    private UserService userService;
    @Mock
    private ExtraRequestRepostirory extraRequestRepostirory;
    @Mock
    private BudgetService budgetService;

    @InjectMocks
    private AssistanceRequestService sut;

    private User owner;
    private User evaluator;
    private AssistanceRequest pendingRequest;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        owner = buildUser(1L, "owner@ufba.br", List.of("FOO"));
        evaluator = buildUser(2L, "evaluator@ufba.br", List.of("EVALUATE_REQUESTS"));

        pendingRequest = buildRequest(10L, owner, 0);
    }

    @Test
    @DisplayName("find() should filter by user when caller lacks VIEW_ALL_REQUESTS")
    void find_shouldReturnOnlyUserRequests_whenCallerHasNoViewAllPerm() {

        when(repo.countByUser(owner)).thenReturn(1L);
        when(queryRepo.findFiltered("createdAt", true, 0, 10, owner))
                .thenReturn(List.of(pendingRequest));

        var result = sut.find("createdAt", true, 0, 10, owner);

        assertThat(result.total).isEqualTo(1);
        assertThat(result.list).singleElement().satisfies(dto -> assertThat(dto.id()).isEqualTo(10L));

        verify(repo, never()).count();
        verify(repo).countByUser(owner);
    }

    @Test
    @DisplayName("find() should query all requests when caller has VIEW_ALL_REQUESTS")
    void find_shouldReturnAll_whenCallerHasViewAllPerm() {
        User admin = buildUser(2L, "admin@ufba.br", List.of("VIEW_ALL_REQUESTS"));
        when(repo.count()).thenReturn(5L);
        when(queryRepo.findFiltered("createdAt", false, 0, 20, null))
                .thenReturn(List.of(pendingRequest));

        var result = sut.find("createdAt", false, 0, 20, admin);

        assertThat(result.total).isEqualTo(5);
        verify(repo).count();
        verify(repo, never()).countByUser(any());
    }

    @Test
    @DisplayName("save() should persist with default situacao=0")
    void save_shouldPersistWithSituacaoZero() {
        AssistanceRequest input = buildRequest(null, owner, null);
        AssistanceRequest saved = buildRequest(11L, owner, 0);

        when(repo.save(input)).thenReturn(saved);

        var result = sut.save(input);

        assertThat(result.getSituacao()).isZero();
    }

    @Nested
    class ReviewSolicitation {

        @Test
        @DisplayName("reviewSolicitation() approves and sets evaluator data")
        void approveFlow() {
            AssistanceRequest toApprove = buildRequest(10L, owner, 1);
            toApprove.setAvaliadorProap(evaluator);
            toApprove.setSituacao(1);

            when(repo.findById(10L)).thenReturn(Optional.of(pendingRequest));
            when(repo.save(any())).thenReturn(toApprove);
            when(repo.findById(10L)).thenReturn(Optional.of(pendingRequest));
            when(repo.save(any())).thenReturn(toApprove);

            var updated = sut.reviewSolicitation(toApprove, owner);

            assertThat(updated.getSituacao()).isEqualTo(1);
            assertThat(updated.getAvaliadorProap()).isSameAs(evaluator);
        }

        @Test
        @DisplayName("reviewSolicitation() throws when situacao invalid")
        void invalidSituacao() {
            AssistanceRequest bad = buildRequest(10L, owner, 5);
            when(repo.findById(10L)).thenReturn(Optional.of(pendingRequest));

            assertThatThrownBy(() -> sut.reviewSolicitation(bad, owner))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Situação");
        }
    }

    private static AssistanceRequest buildRequest(Long id, User user, Integer situacao) {
        AssistanceRequest ar = new AssistanceRequest();
        ar.setId(id);
        ar.setUser(user);
        ar.setSituacao(situacao == null ? 0 : situacao);
        ar.setTituloPublicacao("Sample");
        ar.setAlgumCoautorPGCOMP(Boolean.FALSE);
        ar.setSolicitanteDocente(Boolean.TRUE);
        ar.setNomeDocente("Prof. A");
        ar.setNomeEvento("CONF");
        ar.setEventoInternacional(Boolean.TRUE);
        ar.setDataInicio(LocalDate.now());
        ar.setDataFim(LocalDate.now().plusDays(1));
        ar.setQtdDiasEvento(1);
        ar.setCidade("Salvador");
        ar.setPais("BR");
        ar.setModalidadeParticipacao("Apresentação");
        ar.setIsDolar(true);
        ar.setCotacaoMoeda(BigDecimal.ONE);
        ar.setValorTotal(BigDecimal.TEN);
        return ar;
    }

    private static User buildUser(Long id, String email, List<String> perms) {
        Permission p = new Permission();
        p.setEnabled(true);
        Perfil perfil = new Perfil();
        perfil.setName("Test");
        perfil.setPermissions(perms.stream().map(key -> {
            Permission perm = new Permission();
            perm.setKey(key);
            perm.setEnabled(true);
            return perm;
        }).collect(java.util.stream.Collectors.toSet()));

        User u = new User();
        u.setEmail(email);
        u.setName("Name");
        u.setPerfil(perfil);
        try {
            java.lang.reflect.Field f = User.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(u, id);
        } catch (Exception ignored) {
        }
        return u;
    }
}