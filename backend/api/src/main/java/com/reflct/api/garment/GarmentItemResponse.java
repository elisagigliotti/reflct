package com.reflct.api.garment;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record GarmentItemResponse(
        UUID id,
        String urlOriginale,
        String nome,
        String brand,
        String categoria,
        BigDecimal prezzoAttuale,
        String prezzoStoricoJson,
        String fotoFrontUrl,
        String fotoBackUrl,
        String misureTaglieJson,
        String sourceDomain,
        Instant createdAt,
        /** Prezzo storico piu' alto (da price_history), solo se maggiore del prezzo attuale — alimenta il badge "price drop". Null altrimenti. */
        BigDecimal prezzoPrecedente,
        /** true se il capo e' gia' nel guardaroba (WardrobeItem) dell'utente corrente. */
        boolean preferito
) {
    /** Per i casi in cui non serve il contesto utente (import, dettaglio singolo). */
    public static GarmentItemResponse from(GarmentItem g) {
        return from(g, null, false);
    }

    public static GarmentItemResponse from(GarmentItem g, BigDecimal prezzoPrecedente, boolean preferito) {
        return new GarmentItemResponse(
                g.getId(), g.getUrlOriginale(), g.getNome(), g.getBrand(), g.getCategoria(),
                g.getPrezzoAttuale(), g.getPrezzoStoricoJson(), g.getFotoFrontUrl(), g.getFotoBackUrl(),
                g.getMisureTaglieJson(), g.getSourceDomain(), g.getCreatedAt(),
                prezzoPrecedente, preferito);
    }
}
