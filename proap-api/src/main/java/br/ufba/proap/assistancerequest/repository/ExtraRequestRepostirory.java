package br.ufba.proap.assistancerequest.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
}
