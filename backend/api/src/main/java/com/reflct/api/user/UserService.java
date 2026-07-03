package com.reflct.api.user;

import com.reflct.api.common.exception.BadRequestException;
import com.reflct.api.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse getMe(UUID userId) {
        return UserResponse.from(findOrThrow(userId));
    }

    @Transactional
    public UserResponse updateMe(UUID userId, UpdateUserRequest request) {
        User user = findOrThrow(userId);

        if (request.nome() != null) {
            user.setNome(request.nome());
        }
        if (request.cognome() != null) {
            user.setCognome(request.cognome());
        }
        if (request.username() != null) {
            String username = request.username().toLowerCase().trim();
            if (!username.equals(user.getUsername()) && userRepository.existsByUsername(username)) {
                throw new BadRequestException("Username gia' in uso");
            }
            user.setUsername(username);
        }
        if (request.dataNascita() != null) {
            user.setDataNascita(request.dataNascita());
        }
        if (request.altezzaCm() != null) {
            user.setAltezzaCm(request.altezzaCm());
        }
        if (request.unitaMisura() != null) {
            user.setUnitaMisura(request.unitaMisura());
        }

        return UserResponse.from(userRepository.save(user));
    }

    private User findOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato: " + userId));
    }
}
