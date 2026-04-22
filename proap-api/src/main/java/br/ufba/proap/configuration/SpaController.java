 package br.ufba.proap.configuration;


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import jakarta.servlet.http.HttpServletRequest;


@Controller

public class SpaController {

    @GetMapping(value = "/**/{path:[^\\.]*}")
    public String redirect(HttpServletRequest request) {
        String uri = request.getRequestURI();

        if (uri.startsWith("/api") || uri.startsWith("/actuator")) {
            return "forward:/error";
        }

        return "forward:/index.html";
    }
}
