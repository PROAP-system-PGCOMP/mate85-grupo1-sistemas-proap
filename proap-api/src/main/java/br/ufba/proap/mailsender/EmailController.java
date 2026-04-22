package br.ufba.proap.mailsender;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.ufba.proap.mailsender.dto.EmailDTO;

@RestController
@RequestMapping("/api/email")
public class EmailController {
    @Autowired
    private EmailService emailService;

    @PostMapping
    public void sendEmail(@RequestBody EmailDTO email) {
        System.out.println("Enviando Email");
        emailService.sendEmail(email);

    }

    @PostMapping("teste")
    public void sendTestEmail(@RequestParam("username") String username, @RequestParam("to") String to) {
        System.out.println("Enviando Email de Teste");
        emailService.sendTestEmail(to, username);
    }
}