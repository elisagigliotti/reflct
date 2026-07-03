package com.reflct.api.auth;

import com.reflct.api.common.exception.BadRequestException;
import com.reflct.api.common.security.JwtService;
import com.reflct.api.user.Piano;
import com.reflct.api.user.User;
import com.reflct.api.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtService);
    }

    @Test
    void register_creaUtenteERestituisceToken_quandoEmailNonEsiste() {
        RegisterRequest request = new RegisterRequest(
                "Giulia@Example.com", "password123", "Giulia", "Rossi", "giulia_r", LocalDate.of(2000, 1, 1), 168);

        when(userRepository.existsByEmail("giulia@example.com")).thenReturn(false);
        when(userRepository.existsByUsername("giulia_r")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });
        when(jwtService.generateToken(any(UUID.class), anyString(), anyString())).thenReturn("fake-jwt-token");

        AuthResponse response = authService.register(request);

        assertThat(response.token()).isEqualTo("fake-jwt-token");
        assertThat(response.email()).isEqualTo("giulia@example.com");
        assertThat(response.piano()).isEqualTo(Piano.FREE.name());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_lanciaBadRequest_quandoEmailGiaRegistrata() {
        RegisterRequest request = new RegisterRequest(
                "giulia@example.com", "password123", "Giulia", "Rossi", "giulia_r", LocalDate.of(2000, 1, 1), null);
        when(userRepository.existsByEmail("giulia@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("esiste gia'");
    }

    @Test
    void login_restituisceToken_quandoCredenzialiValide() {
        LoginRequest request = new LoginRequest("giulia@example.com", "password123");
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("giulia@example.com")
                .passwordHash("hashed")
                .nome("Giulia")
                .piano(Piano.FREE)
                .build();

        when(userRepository.findByEmail("giulia@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashed")).thenReturn(true);
        when(jwtService.generateToken(user.getId(), user.getEmail(), Piano.FREE.name())).thenReturn("fake-jwt-token");

        AuthResponse response = authService.login(request);

        assertThat(response.token()).isEqualTo("fake-jwt-token");
        assertThat(response.userId()).isEqualTo(user.getId());
    }

    @Test
    void login_lanciaBadCredentials_quandoPasswordErrata() {
        LoginRequest request = new LoginRequest("giulia@example.com", "wrong-password");
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("giulia@example.com")
                .passwordHash("hashed")
                .nome("Giulia")
                .piano(Piano.FREE)
                .build();

        when(userRepository.findByEmail("giulia@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void login_lanciaBadCredentials_quandoUtenteNonEsiste() {
        LoginRequest request = new LoginRequest("sconosciuto@example.com", "password123");
        when(userRepository.findByEmail("sconosciuto@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);
    }
}
