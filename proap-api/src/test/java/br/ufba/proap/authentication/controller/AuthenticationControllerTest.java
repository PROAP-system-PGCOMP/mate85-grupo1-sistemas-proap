package br.ufba.proap.authentication.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import br.ufba.proap.authentication.service.PasswordResetTokenService;
import br.ufba.proap.security.JwtTokenProvider;
import jakarta.ws.rs.NotFoundException;

public class AuthenticationControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private PasswordResetTokenService passwordResetTokenService;

    @InjectMocks
    private AuthenticationController authenticationController;

    private MockMvc mockMvc;

    private static final String TEST_EMAIL = "usuario.teste@ufba.br";
    private static final String TEST_PASSWORD = "senha123456";
    private static final String TEST_TOKEN = "token-reset-senha-123456";
    private static final String TEST_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3VhcmlvLnRlc3RlQHVmYmEuYnIiLCJpYXQiOjE2ODUzNjAyNTcsImV4cCI6MTY4NTM2Mzg1N30";

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(authenticationController).build();
    }

    @Test
    public void signin_withValidCredentials_shouldReturnToken() throws Exception {
        Authentication authentication = new UsernamePasswordAuthenticationToken(TEST_EMAIL, TEST_PASSWORD);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(tokenProvider.generateToken(any(Authentication.class))).thenReturn(TEST_JWT);
        
        mockMvc.perform(post("/api/authentication/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"" + TEST_EMAIL + "\",\"password\":\"" + TEST_PASSWORD + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value(TEST_JWT))
                .andExpect(jsonPath("$.tokenType").value("Bearer"));
                
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(tokenProvider).generateToken(any(Authentication.class));
    }

    @Test
    public void signin_withInvalidCredentials_shouldReturn401() throws Exception {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Credenciais inválidas"));

        mockMvc.perform(post("/api/authentication/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"" + TEST_EMAIL + "\",\"password\":\"senhaerrada\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value("Erro"));

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    public void resetPassword_withValidEmail_shouldReturnSuccess() throws Exception {
        mockMvc.perform(post("/api/authentication/reset-password")
                .param("email", TEST_EMAIL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Sucesso"))
                .andExpect(jsonPath("$.message").value("Token enviado com sucesso"));

        verify(passwordResetTokenService).sendResetToken(eq(TEST_EMAIL));
    }

    @Test
    public void resetPassword_withInvalidEmail_shouldReturnBadRequest() throws Exception {
        mockMvc.perform(post("/api/authentication/reset-password")
                .param("email", "email-invalido"))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void resetPassword_whenServiceThrowsException_shouldReturnBadRequest() throws Exception {
        doThrow(new NotFoundException("Usuário não encontrado")).when(passwordResetTokenService)
                .sendResetToken(anyString());

        mockMvc.perform(post("/api/authentication/reset-password")
                .param("email", TEST_EMAIL))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("erro"))
                .andExpect(jsonPath("$.message").value("Usuário não encontrado"));

        verify(passwordResetTokenService).sendResetToken(eq(TEST_EMAIL));
    }

    @Test
    public void validateToken_withValidToken_shouldReturnSuccess() throws Exception {
        when(passwordResetTokenService.isPasswordResetTokenValid(TEST_TOKEN)).thenReturn(true);

        mockMvc.perform(get("/api/authentication/reset-password/validate")
                .param("token", TEST_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Sucesso"))
                .andExpect(jsonPath("$.message").value("Token válido"));

        verify(passwordResetTokenService).isPasswordResetTokenValid(eq(TEST_TOKEN));
    }

    @Test
    public void validateToken_withInvalidToken_shouldReturnBadRequest() throws Exception {
        when(passwordResetTokenService.isPasswordResetTokenValid(TEST_TOKEN)).thenReturn(false);

        mockMvc.perform(get("/api/authentication/reset-password/validate")
                .param("token", TEST_TOKEN))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("Erro"))
                .andExpect(jsonPath("$.message").value("Token inválido"));

        verify(passwordResetTokenService).isPasswordResetTokenValid(eq(TEST_TOKEN));
    }

    @Test
    public void validateToken_whenNotFound_shouldReturnBadRequest() throws Exception {
        when(passwordResetTokenService.isPasswordResetTokenValid(TEST_TOKEN))
                .thenThrow(new NotFoundException("Token não encontrado"));

        mockMvc.perform(get("/api/authentication/reset-password/validate")
                .param("token", TEST_TOKEN))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("Erro"))
                .andExpect(jsonPath("$.message").value("Token não encontrado"));

        verify(passwordResetTokenService).isPasswordResetTokenValid(eq(TEST_TOKEN));
    }

    @Test
    public void recoverPassword_withValidData_shouldReturnSuccess() throws Exception {
        when(passwordResetTokenService.isPasswordResetTokenValid(TEST_TOKEN)).thenReturn(true);

        mockMvc.perform(post("/api/authentication/reset-password/confirm")
                .param("token", TEST_TOKEN)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"newPassword\":\"" + TEST_PASSWORD + "\",\"confirmPassword\":\"" + TEST_PASSWORD + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Sucesso"))
                .andExpect(jsonPath("$.message").value("Senha alterada com sucesso"));

        verify(passwordResetTokenService).isPasswordResetTokenValid(eq(TEST_TOKEN));
        verify(passwordResetTokenService).updatePassword(eq(TEST_TOKEN), eq(TEST_PASSWORD));
        verify(passwordResetTokenService).deleteToken(eq(TEST_TOKEN));
    }

    @Test
    public void recoverPassword_withInvalidToken_shouldReturnBadRequest() throws Exception {
        when(passwordResetTokenService.isPasswordResetTokenValid(TEST_TOKEN)).thenReturn(false);

        mockMvc.perform(post("/api/authentication/reset-password/confirm")
                .param("token", TEST_TOKEN)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"newPassword\":\"" + TEST_PASSWORD + "\",\"confirmPassword\":\"" + TEST_PASSWORD + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("Erro"))
                .andExpect(jsonPath("$.message").value("Token inválido"));

        verify(passwordResetTokenService).isPasswordResetTokenValid(eq(TEST_TOKEN));
        verify(passwordResetTokenService, times(0)).updatePassword(anyString(), anyString());
        verify(passwordResetTokenService, times(0)).deleteToken(anyString());
    }

    @Test
    public void recoverPassword_whenServiceThrowsException_shouldReturnBadRequest() throws Exception {
        when(passwordResetTokenService.isPasswordResetTokenValid(TEST_TOKEN)).thenReturn(true);
        doThrow(new RuntimeException("Erro ao atualizar senha")).when(passwordResetTokenService)
                .updatePassword(anyString(), anyString());

        mockMvc.perform(post("/api/authentication/reset-password/confirm")
                .param("token", TEST_TOKEN)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"newPassword\":\"" + TEST_PASSWORD + "\",\"confirmPassword\":\"" + TEST_PASSWORD + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("Erro"))
                .andExpect(jsonPath("$.message").value("Erro ao atualizar senha"));

        verify(passwordResetTokenService).isPasswordResetTokenValid(eq(TEST_TOKEN));
        verify(passwordResetTokenService).updatePassword(eq(TEST_TOKEN), eq(TEST_PASSWORD));
        verify(passwordResetTokenService, times(0)).deleteToken(anyString());
    }
}
