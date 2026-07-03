package com.reflct.api.wardrobe;

import com.reflct.api.garment.GarmentItem;
import com.reflct.api.tryon.TryOnSession;
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
 * Entita' WardrobeItem — Concept Document v4.0, sezione 7 (Modello Dati).
 * Attributi: id, user_id, garment_id, session_id, categoria, categoria_custom, capsule_id,
 * note, is_favorite.
 * Relazioni: N:1 User, N:1 GarmentItem.
 *
 * Nota: rappresenta anche la relazione "User 1:1 Wardrobe" del concept, modellata qui
 * come User 1:N WardrobeItem (vedi commento in User.java).
 */
@Entity
@Table(name = "wardrobe_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WardrobeItem {

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private TryOnSession session;

    @Column(name = "categoria", length = 60)
    private String categoria;

    @Column(name = "categoria_custom", length = 60)
    private String categoriaCustom;

    @Column(name = "capsule_id")
    private UUID capsuleId;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "is_favorite", nullable = false)
    @Builder.Default
    private boolean favorite = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @jakarta.persistence.PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
