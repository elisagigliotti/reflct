package com.reflct.api.outfit;

import com.reflct.api.user.User;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
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
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entita' Outfit — Concept Document v4.0, sezione 7 (Modello Dati).
 * Attributi: id, user_id, nome, item_ids[], foto_cover_url, is_public.
 * Relazioni: N:1 User, N:M WardrobeItem (qui modellata come collezione di UUID
 * verso wardrobe_items, tramite tabella di join outfit_items — l'Outfit Builder
 * descritto in Concept v4.0 sez. 5.4 non richiede un endpoint nel contratto MVP
 * (sez. 8), quindi questo modulo espone solo entita'/repository/service, senza
 * controller REST, pronto per essere collegato quando l'endpoint verra' aggiunto.
 */
@Entity
@Table(name = "outfits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Outfit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "nome", length = 150)
    private String nome;

    @ElementCollection
    @CollectionTable(name = "outfit_items", joinColumns = @JoinColumn(name = "outfit_id"))
    @Column(name = "wardrobe_item_id")
    @Builder.Default
    private List<UUID> itemIds = new ArrayList<>();

    @Column(name = "foto_cover_url")
    private String fotoCoverUrl;

    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private boolean isPublic = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @jakarta.persistence.PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
