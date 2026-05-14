package br.ufba.proap.mailsender;

import java.util.Map;

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

}
