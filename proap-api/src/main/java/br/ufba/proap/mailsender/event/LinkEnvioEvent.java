package br.ufba.proap.mailsender.event;

import org.springframework.context.ApplicationEvent;

public class LinkEnvioEvent extends ApplicationEvent {
    private final String email;

    public LinkEnvioEvent(Object source, String email) {
        super(source);
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}
