package br.ufba.proap.Interceptor.Service;

import br.ufba.proap.Interceptor.Domain.DataConfig;
import br.ufba.proap.Interceptor.Repository.InterceptorRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
public class InterceptorService implements HandlerInterceptor {

    @Autowired
    private InterceptorRepository interceptorRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        Optional<DataConfig> configAux = interceptorRepository.findById(1L);

        if (configAux.isEmpty()) {
            return true;
        }

        DataConfig config = configAux.get();
        LocalDateTime now = LocalDateTime.now();

        boolean outsideStart = config.getStartDate() != null && now.isBefore(config.getStartDate());
        boolean outsideEnd = config.getEndDate() != null && now.isAfter(config.getEndDate());

        if (outsideStart || outsideEnd) {
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"message\": \"O sistema está indisponível no momento ou fora do prazo. Por favor, tente novamente mais tarde.\"}");
            return false;
        }

        return true;
    }
}