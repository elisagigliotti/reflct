package com.reflct.api.tryon;

import com.reflct.api.garment.GarmentItem;
import com.reflct.api.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
 * Entita' TryOnSession — Concept Document v4.0, sezione 7 (Modello Dati).
 * Attributi: id, user_id, garment_id, foto_url, video_url, vista, taglia_consigliata,
 * fit_score, created_at.
 * Relazioni: N:1 User, N:1 Garment.
 */
@Entity
@Table(name = "tryon_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TryOnSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "garment_id", nullable = false)
    private GarmentItem garment;

    @Column(name = "foto_url")
    private String fotoUrl;

    @Column(name = "video_url")
    private String videoUrl;

    /** "FRONTE" o "RETRO" — vedi Concept Document 5.1 (rilevamento rotazione spalle). */
    @Column(name = "vista", length = 20)
    @Builder.Default
    private String vista = "FRONTE";

    @Column(name = "taglia_consigliata", length = 10)
    private String tagliaConsigliata;

    @Column(name = "fit_score", precision = 4, scale = 2)
    private BigDecimal fitScore;

    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @jakarta.persistence.PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (vista == null) {
            vista = "FRONTE";
        }
        if (status == null) {
            status = "PENDING";
        }
    }
}
