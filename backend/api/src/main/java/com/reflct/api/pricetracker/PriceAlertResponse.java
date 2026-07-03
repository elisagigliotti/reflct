package com.reflct.api.pricetracker;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PriceAlertResponse(
        UUID id,
        UUID garmentId,
        BigDecimal soglia,
        boolean active,
        Instant triggeredAt,
        Instant createdAt
) {
    public static PriceAlertResponse from(PriceAlert alert) {
        return new PriceAlertResponse(
                alert.getId(),
                alert.getGarment().getId(),
                alert.getSoglia(),
                alert.isActive(),
                alert.getTriggeredAt(),
                alert.getCreatedAt()
        );
    }
}
