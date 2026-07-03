-- Reflct API — schema iniziale (Concept Document v4.0, sezione 7: Modello Dati).
-- Gli UUID sono generati lato applicazione (Hibernate GenerationType.UUID), quindi
-- le colonne id non hanno un DEFAULT lato database.

CREATE TABLE users (
    id              UUID PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    nome            VARCHAR(150) NOT NULL,
    altezza_cm      INTEGER,
    misure_json     TEXT,
    piano           VARCHAR(20)  NOT NULL DEFAULT 'FREE',
    created_at      TIMESTAMPTZ  NOT NULL
);

CREATE TABLE body_scans (
    id              UUID PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    foto_front_url  TEXT,
    foto_side_url   TEXT,
    misure_json     TEXT,
    video_url       TEXT,
    status          VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_body_scans_user_id ON body_scans(user_id);

CREATE TABLE garment_items (
    id                  UUID PRIMARY KEY,
    url_originale       VARCHAR(2048) NOT NULL,
    nome                VARCHAR(255),
    brand               VARCHAR(150),
    categoria           VARCHAR(60),
    prezzo_attuale      NUMERIC(10, 2),
    prezzo_storico_json TEXT,
    foto_front_url      TEXT,
    foto_back_url       TEXT,
    misure_taglie_json  TEXT,
    source_domain       VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL
);

CREATE TABLE price_history (
    id           UUID PRIMARY KEY,
    garment_id   UUID NOT NULL REFERENCES garment_items(id) ON DELETE CASCADE,
    prezzo       NUMERIC(10, 2) NOT NULL,
    rilevato_at  TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_price_history_garment_id ON price_history(garment_id);

CREATE TABLE tryon_sessions (
    id                  UUID PRIMARY KEY,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    garment_id          UUID NOT NULL REFERENCES garment_items(id) ON DELETE CASCADE,
    foto_url            TEXT,
    video_url           TEXT,
    vista               VARCHAR(20) NOT NULL DEFAULT 'FRONTE',
    taglia_consigliata  VARCHAR(10),
    fit_score           NUMERIC(4, 2),
    status              VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at          TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_tryon_sessions_user_id ON tryon_sessions(user_id);
CREATE INDEX idx_tryon_sessions_garment_id ON tryon_sessions(garment_id);

CREATE TABLE wardrobe_items (
    id                UUID PRIMARY KEY,
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    garment_id        UUID NOT NULL REFERENCES garment_items(id) ON DELETE CASCADE,
    session_id        UUID REFERENCES tryon_sessions(id) ON DELETE SET NULL,
    categoria         VARCHAR(60),
    categoria_custom  VARCHAR(60),
    capsule_id        UUID,
    note              TEXT,
    is_favorite       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_wardrobe_items_user_id ON wardrobe_items(user_id);
CREATE INDEX idx_wardrobe_items_user_categoria ON wardrobe_items(user_id, categoria);

CREATE TABLE outfits (
    id              UUID PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nome            VARCHAR(150),
    foto_cover_url  TEXT,
    is_public       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_outfits_user_id ON outfits(user_id);

CREATE TABLE outfit_items (
    outfit_id         UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
    wardrobe_item_id  UUID NOT NULL
);
CREATE INDEX idx_outfit_items_outfit_id ON outfit_items(outfit_id);

CREATE TABLE social_posts (
    id          UUID PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id  UUID NOT NULL REFERENCES tryon_sessions(id) ON DELETE CASCADE,
    tipo        VARCHAR(20) NOT NULL,
    status      VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    scadenza    TIMESTAMPTZ,
    voti_json   TEXT,
    created_at  TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_social_posts_user_id ON social_posts(user_id);

CREATE TABLE shared_links (
    id             UUID PRIMARY KEY,
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id     UUID NOT NULL REFERENCES tryon_sessions(id) ON DELETE CASCADE,
    token          VARCHAR(40) NOT NULL UNIQUE,
    tipo           VARCHAR(20) NOT NULL,
    scadenza       TIMESTAMPTZ,
    password_hash  VARCHAR(100),
    view_count     BIGINT NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_shared_links_token ON shared_links(token);

CREATE TABLE price_alerts (
    id            UUID PRIMARY KEY,
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    garment_id    UUID NOT NULL REFERENCES garment_items(id) ON DELETE CASCADE,
    soglia        NUMERIC(10, 2) NOT NULL,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    triggered_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_price_alerts_user_id ON price_alerts(user_id);
