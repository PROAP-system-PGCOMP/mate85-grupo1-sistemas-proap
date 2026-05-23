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
        if (now.isBefore(config.getStartDate()) || now.isAfter(config.getEndDate())) {
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("O sistema está indisponível no momento. Por favor, tente novamente mais tarde.");
            return false;
        }

        return true;
    }
}
