package com.reflct.api.share;

import java.time.Instant;
import java.util.UUID;

public record SharedLinkResponse(
        UUID id,
        String token,
        TipoSharedLink tipo,
        Instant scadenza,
        /** Presente SOLO nella risposta di creazione, quando tipo == PIN_PROTECTED: non e' recuperabile in seguito (solo l'hash e' persistito). */
        String pinInChiaro,
        long viewCount,
        Instant createdAt
) {
    public static SharedLinkResponse from(SharedLink link, String pinInChiaro) {
        return new SharedLinkResponse(
                link.getId(), link.getToken(), link.getTipo(), link.getScadenza(),
                pinInChiaro, link.getViewCount(), link.getCreatedAt());
    }
}
