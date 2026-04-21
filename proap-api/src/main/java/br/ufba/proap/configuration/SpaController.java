package br.ufba.proap.configuration;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import jakarta.servlet.http.HttpServletRequest;


@Controller
public class SpaController {

    @RequestMapping(value = { "{path:[^\\.]*}", "/**/{path:[^\\.]*}" })
    public String redirect(HttpServletRequest request) {
        String path = request.getRequestURI();

        if (path.startsWith("/api") || path.startsWith("/index.html") || path.startsWith("/assets")) {
            return "forward:/error";
        }

        return "forward:/index.html";
    }
}}