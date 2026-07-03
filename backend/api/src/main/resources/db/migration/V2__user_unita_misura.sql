-- Aggiunge la preferenza "unita' di misura" al profilo utente (settings.ini nel design,
-- vedi packages/design-tokens/README.md sezione "9. Profilo").
ALTER TABLE users ADD COLUMN unita_misura VARCHAR(4) NOT NULL DEFAULT 'cm';
