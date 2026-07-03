package com.reflct.api.social;

import java.time.Instant;
import java.util.UUID;

public record SocialPostResponse(
        UUID id,
        UUID sessionId,
        UUID garmentId,
        String garmentNome,
        TipoSocialPost tipo,
        String status,
        Instant scadenza,
        String votiJson,
        Instant createdAt
) {
    public static SocialPostResponse from(SocialPost post) {
        var garment = post.getSession().getGarment();
        return new SocialPostResponse(
                post.getId(),
                post.getSession().getId(),
                garment.getId(),
                garment.getNome(),
                post.getTipo(),
                post.getStatus(),
                post.getScadenza(),
                post.getVotiJson(),
                post.getCreatedAt()
        );
    }
}
