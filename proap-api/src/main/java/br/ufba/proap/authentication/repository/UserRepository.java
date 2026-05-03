package br.ufba.proap.authentication.repository;

import java.util.List;
import java.util.Optional;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import br.ufba.proap.authentication.domain.User;

public interface UserRepository extends JpaRepository<User, Long> {

	@Query("SELECT m FROM User m WHERE m.name = :username")
	User findByName(String username);

	Optional<User> findByEmail(String email);

	Optional<User> findByCpf(String cpf);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.password = :newPassword WHERE u.id = :id")
    void updatePasswordById(Long id, String newPassword);

	@Query("SELECT m FROM User m WHERE m.email = :email and m.cpf = :cpf")
	User findByEmailAndCPF(String email, String cpf);

	@Query("SELECT u FROM User u JOIN FETCH u.perfil")
	List<User> findAllWithPerfil();

	@Query("""
				SELECT u FROM User u
				LEFT JOIN FETCH u.perfil p
				LEFT JOIN FETCH p.permissions
				WHERE u.email = :email
			""")
	Optional<User> findByEmailWithPerfilAndPermissions(String email);

	@Query("""
				SELECT u FROM User u
				LEFT JOIN FETCH u.perfil p
				LEFT JOIN FETCH p.permissions
			""")
	List<User> findAllWithPerfilAndPermissions();
}
