package br.ufba.proap.mailsender.event;

public class UserRegisteredByAdminEvent {
    private final String email;
    private final String token;

    public UserRegisteredByAdminEvent(String email, String token) {
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