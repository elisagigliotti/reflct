package com.reflct.api.bodyscan;

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

import java.time.Instant;
import java.util.UUID;

/**
 * Entita' BodyScan — Concept Document v4.0, sezione 7 (Modello Dati).
 * Attributi: id, user_id, foto_front_url, foto_side_url, misure_json, video_url, created_at.
 * Relazione: N:1 User.
 */
@Entity
@Table(name = "body_scans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BodyScan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "foto_front_url")
    private String fotoFrontUrl;

    @Column(name = "foto_side_url")
    private String fotoSideUrl;

    @Column(name = "misure_json", columnDefinition = "TEXT")
    private String misureJson;

    @Column(name = "video_url")
    private String videoUrl;

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
        if (status == null) {
            status = "PENDING";
        }
    }
}
