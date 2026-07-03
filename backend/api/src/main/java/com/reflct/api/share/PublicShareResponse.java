package com.reflct.api.share;

import java.math.BigDecimal;

/**
 * Dati pubblici della pagina di condivisione (GET /api/v1/share/{token}, no-auth),
 * come da Concept v4.0 sez. 5.6: "preview look, dati capo, link e-commerce", niente
 * dati sensibili dell'utente proprietario.
 */
public record PublicShareResponse(
        String garmentNome,
        String garmentBrand,
        BigDecimal garmentPrezzo,
        String garmentUrlOriginale,
        String fotoUrl,
        String videoUrl,
        long viewCount
) {
}
