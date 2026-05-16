package br.ufba.proap.Interceptor.Repository;

import br.ufba.proap.Interceptor.Domain.DataConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterceptorRepository extends JpaRepository<DataConfig, Long> {

    Optional<DataConfig> findById(Long id);
}
