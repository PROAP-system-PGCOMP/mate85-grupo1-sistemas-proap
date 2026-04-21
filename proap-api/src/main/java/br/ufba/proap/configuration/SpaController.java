package br.ufba.proap.configuration;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping(value = "{path:^(?!api|actuator|.*\\.[\\w]+$).*$}/**")
    public String forward() {
        return "forward:/index.html";
    }
}