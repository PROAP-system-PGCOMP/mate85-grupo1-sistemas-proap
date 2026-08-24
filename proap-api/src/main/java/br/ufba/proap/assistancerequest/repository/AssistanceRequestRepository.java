package br.ufba.proap.assistancerequest.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import br.ufba.proap.assistancerequest.domain.dto.DashboardRequestDTO;
import br.ufba.proap.assistancerequest.domain.dto.DashboardResponseDTO;
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

  @Query("SELECT ar.id, ar.valorAprovado, ar.createdAt, ar.dataAvaliacaoProap, ap.name, u.name, u.perfil.name FROM AssistanceRequest ar LEFT JOIN ar.avaliadorProap ap LEFT JOIN ar.user u WHERE DATE(ar.createdAt) BETWEEN :startDate AND :endDate AND ar.situacao = 1")
  List<Object[]> findTotalApprovedValueByDateRange(LocalDate startDate, LocalDate endDate);

  @Query("SELECT SUM(ar.valorAprovado) FROM AssistanceRequest ar WHERE YEAR(ar.createdAt) = :year AND ar.situacao = 1")
	BigDecimal findTotalApprovedValueByYear(Integer year);

	@Query("SELECT ar.id, ar.valorAprovado, ar.dataAvaliacaoProap, ap.name, ar.custoFinalCeapg, ar.observacoesCeapg, ac.name, ar.dataAvaliacaoCeapg, ar.numeroAta FROM AssistanceRequest ar LEFT JOIN ar.avaliadorProap ap LEFT JOIN ar.avaliadorCeapg ac WHERE DATE(ar.dataAvaliacaoProap) BETWEEN :startDate AND :endDate AND ar.situacao = 1")
	List<Object[]> findAllCeapgRequests(LocalDate startDate, LocalDate endDate);

	@Query("SELECT ar.id, ar.valorAprovado, ar.dataAvaliacaoProap, ap.name, ar.custoFinalCeapg, ar.observacoesCeapg, ac.name, ar.dataAvaliacaoCeapg FROM AssistanceRequest ar LEFT JOIN ar.avaliadorProap ap LEFT JOIN ar.avaliadorCeapg ac WHERE DATE (ar.dataAvaliacaoProap) BETWEEN :startDate AND :endDate AND ar.situacao = 1 AND ar.avaliadorCeapg IS NULL")
	List<Object[]> findAllPendingCeapgRequests(LocalDate startDate, LocalDate endDate);

	@Query("SELECT ar.id, ar.valorAprovado, ar.dataAvaliacaoProap, ap.name, ar.custoFinalCeapg, ar.observacoesCeapg, ac.name, ar.dataAvaliacaoCeapg FROM AssistanceRequest ar LEFT JOIN ar.avaliadorProap ap LEFT JOIN ar.avaliadorCeapg ac WHERE DATE (ar.dataAvaliacaoProap) BETWEEN :startDate AND :endDate AND ar.situacao = 1 AND ar.avaliadorCeapg IS NOT NULL")
	List<Object[]> findAllCompletedCeapgRequests(LocalDate startDate, LocalDate endDate);

	@Query(value = "SELECT COUNT(s) > 0 FROM proap_assistancerequest s WHERE s.user_id = :userId", nativeQuery = true)
	Boolean userHasAnySolicitationRequests(Long userId);

        @Query(
                """
                    SELECT new br.ufba.proap.assistancerequest.domain.dto.DashboardResponseDTO(
                        t.user.perfil,
                        t.eventoInternacional,
                        CAST(SUM(t.valorTotal) as bigdecimal),
                        CAST(SUM(CASE
                            WHEN t.situacao = 1 THEN t.valorTotal ELSE 0.0 END)
                         as bigdecimal)
                    )
                    FROM AssistanceRequest t
                    WHERE (:perfil IS NULL OR t.user.perfil.id IN :perfil)
                    AND (:eventoInternacional IS NULL OR t.eventoInternacional = :eventoInternacional)
                    AND (CAST(:startDate AS localdatetime) IS NULL OR t.createdAt >= :startDate)
                    AND (CAST(:endDate AS localdatetime) IS NULL OR t.createdAt <= :endDate)
                    GROUP BY t.user.perfil, t.eventoInternacional
                """
    )
    List<DashboardResponseDTO> mountDashboard(@Param("perfil")List<Long>perfilId,
                                                   @Param("eventoInternacional") Boolean eventoInternacional,
                                                   @Param("startDate")LocalDateTime startDate,
                                                   @Param("endDate")LocalDateTime endDate);

    long count();
}
