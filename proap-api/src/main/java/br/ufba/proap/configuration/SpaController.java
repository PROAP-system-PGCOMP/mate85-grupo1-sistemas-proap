package br.ufba.proap.configuration;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class SpaController {

    @GetMapping("/**")
    public String redirect(HttpServletRequest request) {
        String path = request.getRequestURI();

        if (path.startsWith("/api") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/error") ||
                path.contains(".")) {
            return null;
        }

        return "forward:/";
    }
}