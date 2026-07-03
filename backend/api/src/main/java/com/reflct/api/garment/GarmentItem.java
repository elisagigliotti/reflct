package com.reflct.api.garment;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Entita' GarmentItem — Concept Document v4.0, sezione 7 (Modello Dati).
 * Attributi: id, url_originale, nome, brand, categoria, prezzo_attuale, prezzo_storico_json,
 * foto_front_url, foto_back_url, misure_taglie_json, source_domain.
 * Relazioni: N:M WardrobeItem (tramite WardrobeItem stesso, che referenzia GarmentItem N:1),
 * 1:N PriceHistory.
 */
@Entity
@Table(name = "garment_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GarmentItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "url_originale", nullable = false, length = 2048)
    private String urlOriginale;

    @Column(name = "nome", length = 255)
    private String nome;

    @Column(name = "brand", length = 150)
    private String brand;

    @Column(name = "categoria", length = 60)
    private String categoria;

    @Column(name = "prezzo_attuale", precision = 10, scale = 2)
    private BigDecimal prezzoAttuale;

    @Column(name = "prezzo_storico_json", columnDefinition = "TEXT")
    private String prezzoStoricoJson;

    @Column(name = "foto_front_url")
    private String fotoFrontUrl;

    @Column(name = "foto_back_url")
    private String fotoBackUrl;

    @Column(name = "misure_taglie_json", columnDefinition = "TEXT")
    private String misureTaglieJson;

    @Column(name = "source_domain", length = 255)
    private String sourceDomain;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @jakarta.persistence.PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
