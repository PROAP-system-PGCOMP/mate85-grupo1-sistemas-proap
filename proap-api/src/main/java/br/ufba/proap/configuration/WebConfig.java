package br.ufba.proap.configuration;

import br.ufba.proap.Interceptor.Repository.InterceptorRepository;
import br.ufba.proap.Interceptor.Service.InterceptorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private InterceptorService interceptorService;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(interceptorService)
                .addPathPatterns("/api/assistancerequest/create", "/api/assistancerequest/update", "/api/extrarequest/create", "/api/extrarequest/update")
                .excludePathPatterns("/api/auth/**", "/api/public/**");
    }
}