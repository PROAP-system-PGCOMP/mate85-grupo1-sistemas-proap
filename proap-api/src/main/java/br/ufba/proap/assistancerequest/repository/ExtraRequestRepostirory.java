package br.ufba.proap.assistancerequest.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.cglib.core.Local;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.ufba.proap.assistancerequest.domain.ExtraRequest;
import br.ufba.proap.authentication.domain.User;

@Repository
public interface ExtraRequestRepostirory extends JpaRepository<ExtraRequest, Long> {
	List<ExtraRequest> findByUser(User user);

	long countByUser(User user);

	@Query(value = "SELECT COUNT(s) > 0 FROM proap_extra_request s WHERE s.user_id = :userId", nativeQuery = true)
	Boolean userHasAnyExtraRequests(Long userId);

    @Query("SELECT e FROM ExtraRequest e " +
            "LEFT JOIN FETCH e.user u " +
            "LEFT JOIN FETCH u.perfil " +
            "ORDER BY e.createdAt DESC")
    List<ExtraRequest> findAllWithUserAndPerfil();

    @Query("""
            SELECT e FROM ExtraRequest e
            WHERE (CAST(:startDate AS timestamp) IS NULL OR e.createdAt >= :startDate)
            AND (CAST(:endDate AS timestamp) IS NULL OR e.createdAt <= :endDate)
            AND e.situacao = 1
            ORDER BY e.createdAt DESC
        """)
    List<ExtraRequest> findTotalApprovedValueByDateRange(@Param("startDate") LocalDateTime startDate,
                                                         @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(e.valorAprovado) FROM ExtraRequest e WHERE YEAR(e.createdAt) = :year AND e.situacao = 1")
    BigDecimal findTotalApprovedValueByYear(Integer year);

    @Query("""
            SELECT COUNT(u)
            FROM ExtraRequest u
            WHERE (CAST(:startDate AS localdatetime) IS NULL OR u.createdAt >= :startDate)
            AND (CAST(:endDate AS localdatetime) IS NULL OR u.createdAt <= :endDate)
            """)
    long count(@Param("startDate")LocalDateTime startDate,
               @Param("endDate")LocalDateTime endDate);

    @Query("""
            SELECT COALESCE(SUM(CASE
                WHEN t.situacao = 1 THEN t.valorTotal ELSE 0.0 END), 0.0)
            FROM ExtraRequest t
            WHERE t.user = :user
            AND t.createdAt BETWEEN :startDate AND :endDate
            """)
    BigDecimal totalExtraRequestAprovedByUser(@Param("user") User user,
                                              @Param("startDate") LocalDateTime startDate,
                                              @Param("endDate") LocalDateTime endDate);
}
