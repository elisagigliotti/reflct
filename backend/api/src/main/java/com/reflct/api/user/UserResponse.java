package com.reflct.api.user;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String nome,
        String cognome,
        String username,
        LocalDate dataNascita,
        Integer altezzaCm,
        String misureJson,
        String unitaMisura,
        Piano piano,
        Instant createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getNome(),
                user.getCognome(),
                user.getUsername(),
                user.getDataNascita(),
                user.getAltezzaCm(),
                user.getMisureJson(),
                user.getUnitaMisura(),
                user.getPiano(),
                user.getCreatedAt()
        );
    }
}
