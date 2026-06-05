package br.ufba.proap.Interceptor.Service;

import br.ufba.proap.Interceptor.Domain.DataConfig;
import br.ufba.proap.Interceptor.Repository.InterceptorRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import java.time.LocalDateTime;

@Component
public class InterceptorService implements HandlerInterceptor {

    @Autowired
    private InterceptorRepository interceptorRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        DataConfig config = interceptorRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Configuração de Interceptação não encontrada"));

        LocalDateTime now = LocalDateTime.now();
        
        // Verifica se a data não é nula ANTES de tentar comparar
        boolean isBeforeStart = config.getStartDate() != null && now.isBefore(config.getStartDate());
        boolean isAfterEnd = config.getEndDate() != null && now.isAfter(config.getEndDate());

        if (isBeforeStart || isAfterEnd) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST); // Mudado para 400 para o Axios do front tratar mais fácil
            response.setContentType("application/json"); // Retorna como JSON para o frontend entender
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"message\": \"Fora do prazo de submissão ou sistema indisponível.\"}");
            return false;
        }

        return true;
    }
}