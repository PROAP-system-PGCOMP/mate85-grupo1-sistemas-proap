package br.ufba.proap.configuration;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    // 1. Captura rotas simples (ex: /home, /login) e evita arquivos (css, js)
    @GetMapping(value = "/{path:[^\\.]*}")
    public String redirect() {
        return "forward:/index.html";
    }

    // 2. Captura rotas profundas (ex: /usuarios/editar/1)
    // MAS ignora se começar com /api ou /actuator (para não quebrar o banco)
    @GetMapping(value = "/{target:^(?!api|actuator).*$}/**/{path:[^\\.]*}")
    public String redirectDeep() {
        return "forward:/index.html";
    }
}