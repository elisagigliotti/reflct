package com.reflct.api.auth;

import com.reflct.api.common.exception.BadRequestException;
import com.reflct.api.common.security.JwtService;
import com.reflct.api.user.Piano;
import com.reflct.api.user.User;
import com.reflct.api.user.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().toLowerCase().trim();
        String username = request.username().toLowerCase().trim();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Un utente con questa email esiste gia'");
        }
        if (userRepository.existsByUsername(username)) {
            throw new BadRequestException("Username gia' in uso");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .nome(request.nome())
                .cognome(request.cognome())
                .username(username)
                .dataNascita(request.dataNascita())
                .altezzaCm(request.altezzaCm())
                .piano(Piano.FREE)
                .build();

        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved.getId(), saved.getEmail(), saved.getPiano().name());

        return new AuthResponse(token, saved.getId(), saved.getEmail(), saved.getNome(), saved.getPiano().name());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase().trim())
                .orElseThrow(() -> new BadCredentialsException("Credenziali non valide"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Credenziali non valide");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getPiano().name());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getNome(), user.getPiano().name());
    }
}
