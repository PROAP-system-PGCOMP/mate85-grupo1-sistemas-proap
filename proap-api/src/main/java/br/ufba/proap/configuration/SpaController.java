package br.ufba.proap.configuration;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    // No Spring 3, para pegar tudo, usamos esta regex no path variable
    @GetMapping(value = "/{path:[^\.]}")
    public String redirect() {
        return "forward:/index.html";
    }

    // Para garantir rotas com "duas barras" como /usuario/perfil
    @GetMapping(value = "//{path:[^\.]*}")
    public String redirectDeep() {
        return "forward:/index.html";
    }
}