package com.reflct.api.bodyscan;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Richiesta di avvio body-scan. In un flusso reale le foto/video verrebbero caricate
 * su MinIO da un endpoint di upload dedicato e qui si passerebbero solo gli URL
 * risultanti (come previsto in questo scaffold).
 *
 * `altezzaCm` e' obbligatoria: ai-service la richiede per calibrare la stima delle
 * misure corporee (Concept v4.0 sez. 5.3 — "calibrazione tramite altezza inserita
 * manualmente dall'utente").
 */
public record BodyScanRequest(
        @NotBlank String fotoFrontUrl,
        String fotoSideUrl,
        String videoUrl,
        @NotNull @Positive Integer altezzaCm
) {
}
