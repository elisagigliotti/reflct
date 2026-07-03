package com.reflct.api.tryon;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TryOnSessionResponse(
        UUID id,
        UUID garmentId,
        String fotoUrl,
        String videoUrl,
        String vista,
        String tagliaConsigliata,
        BigDecimal fitScore,
        String status,
        Instant createdAt
) {
    public static TryOnSessionResponse from(TryOnSession session) {
        return new TryOnSessionResponse(
                session.getId(),
                session.getGarment().getId(),
                session.getFotoUrl(),
                session.getVideoUrl(),
                session.getVista(),
                session.getTagliaConsigliata(),
                session.getFitScore(),
                session.getStatus(),
                session.getCreatedAt()
        );
    }
}
