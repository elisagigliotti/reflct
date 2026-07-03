package com.reflct.api.garment;

import java.math.BigDecimal;
import java.time.Instant;

/** Punto di storico prezzo (nuovo — alimenta la sparkline reale di pricewatch.sys). */
public record PriceHistoryPointResponse(BigDecimal prezzo, Instant rilevatoAt) {
    public static PriceHistoryPointResponse from(PriceHistory history) {
        return new PriceHistoryPointResponse(history.getPrezzo(), history.getRilevatoAt());
    }
}
