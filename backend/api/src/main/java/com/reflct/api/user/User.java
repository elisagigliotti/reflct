package com.reflct.api.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Entita' User — Concept Document v4.0, sezione 7 (Modello Dati).
 * Attributi: id, email, password_hash, nome, altezza_cm, misure_json, piano (FREE/PREMIUM/PRO), created_at.
 * Relazioni: 1:N TryOnSession, 1:N SharedLink.
 *
 * Nota implementativa: il concept descrive "1:1 Wardrobe" ma nel modello dati concreto
 * (vedi entita' WardrobeItem: N:1 User) si tratta in realta' di una relazione 1:N tra
 * User e WardrobeItem (un utente possiede molteplici capi in guardaroba, non un singolo
 * oggetto "Wardrobe"). Qui modelliamo quindi User 1:N WardrobeItem, che e' la relazione
 * effettivamente coerente con il resto della tabella del modello dati.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "nome", nullable = false, length = 150)
    private String nome;

    @Column(name = "cognome", nullable = false, length = 150)
    private String cognome;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "data_nascita", nullable = false)
    private LocalDate dataNascita;

    @Column(name = "altezza_cm")
    private Integer altezzaCm;

    /** Misure corporee sintetiche in formato JSON (usato anche come cache dell'ultimo BodyScan). */
    @Column(name = "misure_json", columnDefinition = "TEXT")
    private String misureJson;

    @Enumerated(EnumType.STRING)
    @Column(name = "piano", nullable = false, length = 20)
    @Builder.Default
    private Piano piano = Piano.FREE;

    /** "cm" o "in" — preferenza utente per le unita' di misura (settings.ini nel design). */
    @Column(name = "unita_misura", nullable = false, length = 4)
    @Builder.Default
    private String unitaMisura = "cm";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @jakarta.persistence.PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (piano == null) {
            piano = Piano.FREE;
        }
        if (unitaMisura == null) {
            unitaMisura = "cm";
        }
    }
}
