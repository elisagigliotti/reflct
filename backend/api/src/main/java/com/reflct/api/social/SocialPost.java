package com.reflct.api.social;

import com.reflct.api.tryon.TryOnSession;
import com.reflct.api.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
 * Entita' SocialPost — Concept Document v4.0, sezione 7 (Modello Dati).
 * Attributi: id, user_id, session_id, tipo (RATE/BATTLE), status, scadenza, voti_json.
 * Relazioni: N:1 User, N:1 TryOnSession.
 */
@Entity
@Table(name = "social_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialPost {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private TryOnSession session;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 20)
    private TipoSocialPost tipo;

    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "ACTIVE";

    /** Solo per BATTLE: scadenza sfida a 24h dalla creazione (Concept v4.0 sez. 5.5). Null per RATE. */
    @Column(name = "scadenza")
    private Instant scadenza;

    /** Conteggio voti in JSON: {"fire":0,"meh":0,"skip":0} per RATE, {"a":0,"b":0} per BATTLE. */
    @Column(name = "voti_json", columnDefinition = "TEXT")
    private String votiJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @jakarta.persistence.PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (status == null) {
            status = "ACTIVE";
        }
    }
}
