package br.ufba.proap.authentication.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.password.PasswordEncoder;

import br.ufba.proap.authentication.domain.PasswordResetToken;
import br.ufba.proap.authentication.domain.User;
import br.ufba.proap.authentication.repository.PasswordResetTokenRepository;
import br.ufba.proap.authentication.repository.UserRepository;
import br.ufba.proap.mailsender.event.PasswordResetTokenEvent;
import jakarta.ws.rs.NotFoundException;

public class PasswordResetTokenServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private UserService userService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private PasswordResetTokenService passwordResetTokenService;

    private User testUser;
    private PasswordResetToken testToken;
    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_PASSWORD = "password123";
    private static final String TEST_TOKEN = "test-token-uuid";

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);

        testUser = new User();
        testUser.setEmail(TEST_EMAIL);
        ReflectionTestUtils.setField(testUser, "id", 1L);
        testUser.setPassword("old-password-hash");

        testToken = new PasswordResetToken();
        testToken.setToken(TEST_TOKEN);
        testToken.setUser(testUser);
        testToken.setExpiryDate(LocalDateTime.now().plusMinutes(60));
    }

    @Test
    public void createResetToken_WhenUserExists_ShouldCreateToken() {
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(tokenRepository.findByUser(testUser)).thenReturn(Optional.empty());
        when(tokenRepository.save(any(PasswordResetToken.class))).thenReturn(testToken);

        String token = passwordResetTokenService.createResetToken(TEST_EMAIL);

        assertNotNull(token);
        verify(userRepository).findByEmail(TEST_EMAIL);
        verify(tokenRepository).findByUser(testUser);
        verify(tokenRepository).save(any(PasswordResetToken.class));
    }

    @Test
    public void createResetToken_WhenTokenExists_ShouldUpdateToken() {
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(tokenRepository.findByUser(testUser)).thenReturn(Optional.of(testToken));
        when(tokenRepository.save(any(PasswordResetToken.class))).thenReturn(testToken);

        String token = passwordResetTokenService.createResetToken(TEST_EMAIL);

        assertNotNull(token);
        verify(tokenRepository).save(testToken);
    }

    @Test
    public void createResetToken_WhenUserDoesNotExist_ShouldThrowException() {
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> {
            passwordResetTokenService.createResetToken(TEST_EMAIL);
        });

        verify(tokenRepository, times(0)).save(any(PasswordResetToken.class));
    }

    @Test
    public void createResetToken_WhenSaveFails_ShouldThrowException() {
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(tokenRepository.findByUser(testUser)).thenReturn(Optional.empty());
        when(tokenRepository.save(any(PasswordResetToken.class))).thenThrow(new DataAccessException("Database error") {
        });

        assertThrows(DataAccessException.class, () -> {
            passwordResetTokenService.createResetToken(TEST_EMAIL);
        });
    }

    @Test
    public void sendResetToken_ShouldPublishEvent() {
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(tokenRepository.findByUser(testUser)).thenReturn(Optional.empty());
        when(tokenRepository.save(any(PasswordResetToken.class))).thenReturn(testToken);

        passwordResetTokenService.sendResetToken(TEST_EMAIL);

        verify(eventPublisher).publishEvent(any(PasswordResetTokenEvent.class));
    }

    @Test
    public void isPasswordResetTokenValid_WhenValid_ShouldReturnTrue() {
        when(tokenRepository.findByToken(TEST_TOKEN)).thenReturn(Optional.of(testToken));

        boolean result = passwordResetTokenService.isPasswordResetTokenValid(TEST_TOKEN);

        assertTrue(result);
    }

    @Test
    public void isPasswordResetTokenValid_WhenTokenNotFound_ShouldThrowException() {
        when(tokenRepository.findByToken(TEST_TOKEN)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> {
            passwordResetTokenService.isPasswordResetTokenValid(TEST_TOKEN);
        });
    }

    @Test
    public void isPasswordResetTokenValid_WhenExpired_ShouldThrowException() {
        testToken.setExpiryDate(LocalDateTime.now().minusMinutes(1));
        when(tokenRepository.findByToken(TEST_TOKEN)).thenReturn(Optional.of(testToken));

        assertThrows(NotFoundException.class, () -> {
            passwordResetTokenService.isPasswordResetTokenValid(TEST_TOKEN);
        });
    }

    @Test
    public void updatePassword_ShouldUpdateUserPassword() {
        when(tokenRepository.findByToken(TEST_TOKEN)).thenReturn(Optional.of(testToken));

        when(passwordEncoder.encode((anyString()))).thenReturn(TEST_PASSWORD);

        passwordResetTokenService.updatePassword(TEST_TOKEN, TEST_PASSWORD);

        verify(userRepository).updatePasswordById(anyLong(), eq(TEST_PASSWORD));
    }

    @Test
    public void updatePassword_WhenServiceFails_ShouldThrowException() {
        org.springframework.test.util.ReflectionTestUtils.setField(testUser, "id", 1L);

        when(tokenRepository.findByToken(TEST_TOKEN)).thenReturn(Optional.of(testToken));

        when(passwordEncoder.encode(anyString())).thenReturn("anyEncodedPassword");

        doThrow(new DataAccessException("Database error") {})
                .when(userRepository).updatePasswordById(anyLong(), anyString());

        assertThrows(DataAccessException.class, () -> {
            passwordResetTokenService.updatePassword(TEST_TOKEN, TEST_PASSWORD);
        });
    }
    @Test
    public void deleteToken_ShouldDeleteToken() {
        when(tokenRepository.findByToken(TEST_TOKEN)).thenReturn(Optional.of(testToken));

        passwordResetTokenService.deleteToken(TEST_TOKEN);

        verify(tokenRepository).delete(testToken);
    }

    @Test
    public void deleteToken_WhenTokenNotFound_ShouldThrowException() {
        when(tokenRepository.findByToken(TEST_TOKEN)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> {
            passwordResetTokenService.deleteToken(TEST_TOKEN);
        });
    }

    @Test
    public void deleteToken_WhenDeleteFails_ShouldThrowException() {
        when(tokenRepository.findByToken(TEST_TOKEN)).thenReturn(Optional.of(testToken));
        doThrow(new DataAccessException("Database error") {
        }).when(tokenRepository).delete(any(PasswordResetToken.class));

        assertThrows(DataAccessException.class, () -> {
            passwordResetTokenService.deleteToken(TEST_TOKEN);
        });
    }
}
