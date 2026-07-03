package com.reflct.api.share;

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
 * Entita' SharedLink — Concept Document v4.0, sezione 7 (Modello Dati).
 * Attributi: id, session_id, user_id, token, tipo, scadenza, password_hash, view_count.
 * Relazioni: N:1 User, N:1 TryOnSession.
 */
@Entity
@Table(name = "shared_links")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharedLink {

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

    @Column(name = "token", nullable = false, unique = true, length = 40)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 20)
    private TipoSharedLink tipo;

    @Column(name = "scadenza")
    private Instant scadenza;

    /** Hash BCrypt del PIN a 4 cifre, valorizzato solo se tipo == PIN_PROTECTED. */
    @Column(name = "password_hash", length = 100)
    private String passwordHash;

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private long viewCount = 0L;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @jakarta.persistence.PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
