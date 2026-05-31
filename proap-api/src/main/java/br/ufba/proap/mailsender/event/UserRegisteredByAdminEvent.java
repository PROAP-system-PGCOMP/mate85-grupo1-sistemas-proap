package br.ufba.proap.mailsender.event;
import org.springframework.context.ApplicationEvent;


public class UserRegisteredByAdminEvent extends ApplicationEvent {
    private final String email;
    private final String token;

    public UserRegisteredByAdminEvent(Object source, String email, String token) {
        super(source);
        this.email = email;
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public String getToken() {
        return token;
    }
}