package br.ufba.proap.configuration;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class SpaController {

    /**
     * Redireciona rotas que não são arquivos (não possuem ponto) 
     * e que NÃO começam com /api ou /actuator para o index.html.
     */
    @GetMapping(value = "{path:^(?!api|actuator|.*\\.[\\w]+$).*$}/**")
    public String redirect() {
        return "forward:/index.html";
    }
}
