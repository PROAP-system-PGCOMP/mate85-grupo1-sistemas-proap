package br.ufba.proap.configuration;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class SpaController {

    @RequestMapping(value = { "/{path:[^\\.]*}", "/**/{path:[^\\.]*}"})
    public String redirect(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Se a URL começar com /api, não faz forward, deixa dar 404 de verdade
        if (path.startsWith("/api")) {
            return "forward:/error";
        }
        return "forward:/index.html";
    }
}