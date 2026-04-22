package br.ufba.proap.configuration;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class SpaController {

    @GetMapping(value = "/{path:[^\.]}")
    public String redirect() {
        return "forward:/index.html";
    }

    // Este cara captura rotas profundas, MAS ignora explicitamente a API
   @GetMapping(value = "/{target:^(?!api|actuator).$}/*/{path:[^\.]}")
    public String redirectDeep() {
        return "forward:/index.html";
    }
}