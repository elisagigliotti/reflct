-- Completa il profilo utente (Concept v4.0 sez. 4): cognome, username univoco, data di nascita.
ALTER TABLE users ADD COLUMN cognome VARCHAR(150);
ALTER TABLE users ADD COLUMN username VARCHAR(50);
ALTER TABLE users ADD COLUMN data_nascita DATE;

-- Backfill per eventuali righe gia' presenti (create prima di questa migration).
UPDATE users
SET cognome = COALESCE(cognome, 'N/D'),
    username = COALESCE(username, 'user_' || substr(replace(id::text, '-', ''), 1, 10)),
    data_nascita = COALESCE(data_nascita, DATE '2000-01-01')
WHERE cognome IS NULL OR username IS NULL OR data_nascita IS NULL;

ALTER TABLE users ALTER COLUMN cognome SET NOT NULL;
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
ALTER TABLE users ALTER COLUMN data_nascita SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT uq_users_username UNIQUE (username);
