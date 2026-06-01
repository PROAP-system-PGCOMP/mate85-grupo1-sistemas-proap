package br.ufba.proap.mailsender;

import java.util.Map;

import br.ufba.proap.mailsender.event.LinkEnvioEvent;
import br.ufba.proap.mailsender.event.UserRegisteredByAdminEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import br.ufba.proap.mailsender.event.PasswordResetTokenEvent;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class EmailNotificationListener {

    @Value("${mail.template.url.recoverPassword}")
    private String recoverUrl;

    @Value("${mail.template.url.createAccount}")
    private String createAccountUrl;

    @Autowired
    private EmailService emailService;

    @EventListener
    public void handlePasswordResetEvent(PasswordResetTokenEvent event) {
        log.info("Novo evento de Recuperação de Senha para {}", event.getEmail());
        String templateName = "password-reset";
        Map<String, Object> variables = Map.of(
                "token", event.getToken(),
                "email", event.getEmail(),
                "url", recoverUrl + "?token=");

        emailService.sendTemplateEmail(event.getEmail(), "Recuperação de Senha | PROAP", templateName, variables);
    }

    @EventListener
    public void handleUserRegisteredByAdminEvent(UserRegisteredByAdminEvent event) {
        log.info("Novo usuário criado pelo Admin: {}", event.getEmail());
        String templateName = "user-registered-by-admin";
        Map<String, Object> variables = Map.of(
                "token", event.getToken(),
                "email", event.getEmail(),
                "url", recoverUrl + "?token=");

        emailService.sendTemplateEmail(
                event.getEmail(),
                "Bem-vindo ao PROAP! Acesse sua conta",
                templateName,
                variables
        );
    }

    @EventListener
    public void handleLinkEnvioEvent(LinkEnvioEvent event) {
        log.info("Aqui o convite de acesso ao PROAP! {}", event.getEmail());
        String templateName = "SendEmail";
        Map<String, Object> variables = Map.of(
                "email", event.getEmail(),
                "url", createAccountUrl);

        emailService.sendTemplateEmail(event.getEmail(), "Link de Acesso | PROAP", templateName, variables);
    }

}
