package br.ufba.proap.assistancerequest.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import br.ufba.proap.assistancerequest.domain.dto.DashboardRequestDTO;
import br.ufba.proap.assistancerequest.domain.dto.DashboardResponseDTO;
import org.springframework.cglib.core.Local;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.ufba.proap.assistancerequest.domain.AssistanceRequest;
import br.ufba.proap.authentication.domain.User;

@Repository
public interface AssistanceRequestRepository extends JpaRepository<AssistanceRequest, Long> {
	List<AssistanceRequest> findByUser(User user);

	long countByUser(User user);

  @Query("SELECT ar.id, ar.valorAprovado, ar.createdAt, ar.dataAvaliacaoProap, ap.name, u.name, p.name, ar.custoFinalCeapg, ac.name FROM AssistanceRequest ar LEFT JOIN ar.avaliadorProap ap LEFT JOIN ar.avaliadorCeapg ac LEFT JOIN ar.user u LEFT JOIN u.perfil p WHERE DATE(ar.createdAt) BETWEEN :startDate AND :endDate AND ar.situacao = 1")
  List<Object[]> findTotalApprovedValueByDateRange(LocalDate startDate, LocalDate endDate);

  @Query("SELECT SUM(ar.valorAprovado) FROM AssistanceRequest ar WHERE YEAR(ar.createdAt) = :year AND ar.situacao = 1")
	BigDecimal findTotalApprovedValueByYear(Integer year);

	@Query("SELECT ar.id, ar.valorAprovado, ar.dataAvaliacaoProap, ap.name, ar.custoFinalCeapg, ar.observacoesCeapg, ac.name, ar.dataAvaliacaoCeapg, ar.numeroAta, u.name FROM AssistanceRequest ar LEFT JOIN ar.avaliadorProap ap LEFT JOIN ar.avaliadorCeapg ac LEFT JOIN ar.user u WHERE DATE(COALESCE(ar.dataAvaliacaoProap, ar.createdAt)) BETWEEN :startDate AND :endDate AND ar.situacao IN(0,1)")
	List<Object[]> findAllCeapgRequests(LocalDate startDate, LocalDate endDate);

	@Query("SELECT ar.id, ar.valorAprovado, ar.dataAvaliacaoProap, ap.name, ar.custoFinalCeapg, ar.observacoesCeapg, ac.name, ar.dataAvaliacaoCeapg, ar.numeroAta, u.name FROM AssistanceRequest ar LEFT JOIN ar.avaliadorProap ap LEFT JOIN ar.avaliadorCeapg ac LEFT JOIN ar.user u WHERE DATE(COALESCE(ar.dataAvaliacaoProap, ar.createdAt)) BETWEEN :startDate AND :endDate AND ar.situacao IN(0,1) AND ar.avaliadorCeapg IS NULL")
	List<Object[]> findAllPendingCeapgRequests(LocalDate startDate, LocalDate endDate);

	@Query("SELECT ar.id, ar.valorAprovado, ar.dataAvaliacaoProap, ap.name, ar.custoFinalCeapg, ar.observacoesCeapg, ac.name, ar.dataAvaliacaoCeapg, ar.numeroAta, u.name FROM AssistanceRequest ar LEFT JOIN ar.avaliadorProap ap LEFT JOIN ar.avaliadorCeapg ac LEFT JOIN ar.user u WHERE DATE(COALESCE(ar.dataAvaliacaoProap, ar.createdAt)) BETWEEN :startDate AND :endDate AND ar.situacao IN(0,1) AND ar.avaliadorCeapg IS NOT NULL")
	List<Object[]> findAllCompletedCeapgRequests(LocalDate startDate, LocalDate endDate);

	@Query(value = "SELECT COUNT(s) > 0 FROM proap_assistancerequest s WHERE s.user_id = :userId", nativeQuery = true)
	Boolean userHasAnySolicitationRequests(Long userId);

    /**
     * Agregação do dashboard de Gestão, agrupada por tipo de solicitante e origem do evento.
     * <ul>
     * <li>Docente/Discente vem de {@code solicitanteDocente} (campo do formulário), e não do perfil
     * do usuário: o perfil pode ser "Docente e Admin", "Admin" etc., e um docente pode solicitar
     * em nome de um discente.</li>
     * <li>{@code totalDiariasAprovadas} soma apenas o valor das diárias (BRL) das solicitações
     * aprovadas, com a mesma fórmula do formulário: valorDiaria × cotação (se USD) × quantidade,
     * descontando meia diária quando a última não é integral.</li>
     * <li>{@code totalAprovado} soma {@code valorAprovado} (valor definido pelo PROAP) das aprovadas.</li>
     * <li>{@code qtdInscricoes} conta solicitações com valorInscricao &gt; 0;
     * {@code qtdPassagensAprovadas} conta solicitações aprovadas com valorPassagem &gt; 0.</li>
     * </ul>
     */
    @Query(
            """
                SELECT new br.ufba.proap.assistancerequest.domain.dto.DashboardResponseDTO(
                    t.solicitanteDocente,
                    t.eventoInternacional,
                    CAST(COALESCE(SUM(t.valorTotal), 0) as bigdecimal),
                    CAST(COALESCE(SUM(CASE WHEN t.situacao = 1 THEN t.valorAprovado ELSE 0.0 END), 0) as bigdecimal),
                    COUNT(t),
                    SUM(CASE WHEN t.valorInscricao > 0 THEN 1 ELSE 0 END),
                    SUM(CASE WHEN t.situacao = 1 AND t.valorPassagem > 0 THEN 1 ELSE 0 END),
                    CAST(COALESCE(SUM(CASE WHEN t.situacao = 1 THEN
                        COALESCE(t.valorDiaria, 0)
                        * (CASE WHEN t.isDolar = true THEN COALESCE(t.cotacaoMoeda, 1) ELSE 1 END)
                        * (CASE
                              WHEN COALESCE(t.quantidadeDiariasSolicitadas, 0) > 1 AND t.ultimaDiariaIntegral = false
                                  THEN t.quantidadeDiariasSolicitadas - 0.5
                              ELSE COALESCE(t.quantidadeDiariasSolicitadas, 0)
                           END)
                        ELSE 0.0 END), 0) as bigdecimal)
                )
                FROM AssistanceRequest t
                LEFT JOIN t.user u
                LEFT JOIN u.perfil p
                WHERE (:perfil IS NULL OR p.id IN :perfil)
                AND (:eventoInternacional IS NULL OR t.eventoInternacional = :eventoInternacional)
                AND (CAST(:startDate AS localdatetime) IS NULL OR t.createdAt >= :startDate)
                AND (CAST(:endDate AS localdatetime) IS NULL OR t.createdAt <= :endDate)
                GROUP BY t.solicitanteDocente, t.eventoInternacional
            """
    )
    List<DashboardResponseDTO> mountDashboard(@Param("perfil")List<Long>perfilId,
                                                   @Param("eventoInternacional") Boolean eventoInternacional,
                                                   @Param("startDate")LocalDateTime startDate,
                                                   @Param("endDate")LocalDateTime endDate);
    @Query("""
            SELECT COUNT(u)
            FROM AssistanceRequest u
            WHERE (CAST(:startDate AS localdatetime) IS NULL OR u.createdAt >= :startDate)
            AND (CAST(:endDate AS localdatetime) IS NULL OR u.createdAt <= :endDate)
            """)
    long count(@Param("startDate")LocalDateTime startDate,
               @Param("endDate")LocalDateTime endDate);

    @Query("""
            SELECT COALESCE(SUM(CASE
                WHEN t.situacao = 1 THEN t.valorTotal ELSE 0.0 END), 0.0)
            FROM AssistanceRequest t
            WHERE t.user = :user
            AND t.createdAt BETWEEN :startDate AND :endDate
            """)
    BigDecimal totalAssistanceRequestAprovedByUser(@Param("user") User user,
                                                   @Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);
}
