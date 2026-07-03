package com.reflct.api.share;

/**
 * Tipo di link di condivisione — Concept Document v4.0, sezione 5.6 (Condivisione).
 * Rispecchia le opzioni "Link permanente / 24h / 7gg / 30gg / con PIN" del design.
 */
public enum TipoSharedLink {
    PERMANENT,
    H24,
    D7,
    D30,
    PIN_PROTECTED
}
