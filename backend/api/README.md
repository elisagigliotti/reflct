# Reflct API — Backend (Spring Boot 3 / Java 21)

Backend REST della piattaforma Reflct, come da Concept Document v4.0 (sezioni 4, 7, 8).
Non è un frontend: espone solo API. Le due controparti in Python (`backend/ai-service`,
`backend/scraping-service`) gestiscono AI e scraping; questo servizio orchestra tutto
(auth, persistenza, business logic) e le chiama via HTTP.

## Prerequisiti

Richiede Maven 3.9+ e JDK 21, più un Postgres raggiungibile (vedi sotto).

```bash
cd backend/api
mvn spring-boot:run   # profilo default: Postgres reale + Flyway, dati persistenti
```

**Database**: questa macchina non ha Docker, quindi al posto di `docker compose up postgres`
(vedi `infra/`, resta la via consigliata se Docker è disponibile) è stato installato
PostgreSQL 17 nativo via winget. Ruolo/DB creati manualmente:
`CREATE ROLE reflct LOGIN PASSWORD 'reflct'; CREATE DATABASE reflct OWNER reflct;`
(combaciano con i default di `application.yml`: `DB_HOST=localhost`, `DB_USER=reflct`,
`DB_PASSWORD=reflct`, `DB_NAME=reflct`). Flyway applica `V1__init.sql`/`V2__...` al primo
avvio. **Verificato**: riavviato il backend a freddo e il login con l'account demo
restituisce lo stesso `userId` di prima — i dati sopravvivono davvero al riavvio, a
differenza del profilo `dev` (H2 in-memory) usato nelle fasi iniziali di questo scaffold.

Il profilo `dev` (`-Dspring-boot.run.profiles=dev`, H2 in-memory) resta disponibile per
iterare senza toccare il DB reale, ma **si svuota ad ogni riavvio**: non usarlo se serve
persistenza (es. per un account demo da mostrare).

**Build verificata**: `mvn clean package` e `mvn test` sono stati eseguiti con successo
su questa macchina (Maven 3.9.16 scaricato e installato appositamente) — build pulita,
**11/11 test unitari passati**. Il server è stato anche avviato per davvero (profilo
`dev`, H2) e testato end-to-end con `curl`: registrazione → login → `GET`/`PATCH
/users/me` → `GET /garments` (catalogo) → `POST /gallery/{id}/toggle-favorite` →
`GET /gallery`, tutto funzionante. Durante la verifica sono emersi e sono stati
corretti bug reali:
- `AuthService.register`: l'email veniva normalizzata in minuscolo solo prima del
  salvataggio, non prima del controllo `existsByEmail` — permetteva potenzialmente
  doppie registrazioni con maiuscole diverse.
- I client verso ai-service/scraping-service erano stati scritti indovinando il
  contratto (i tre componenti sono stati sviluppati in parallelo senza vedersi): path
  ed emit di campi sbagliati, riallineati ai contratti REST realmente implementati.

Swagger UI (dopo l'avvio): `http://localhost:8080/swagger-ui.html`.

## Struttura per modulo

```
src/main/java/com/reflct/api/
  auth/            register / login, JWT reale (HS256, non uno stub)
  user/             GET/PATCH /api/v1/users/me (profilo reale: nome, altezza, unità di misura), entità User + Piano
  bodyscan/         POST /api/v1/body-scan, GET /api/v1/body-scan/me — delega ad ai-service
  garment/          GET /api/v1/garments (catalogo/feed paginato, con price-drop reale e stato preferito), POST /garments/import, GET /garments/{id} — import delega a scraping-service
  tryon/            POST /api/v1/tryon/start, GET /api/v1/tryon/{sessionId} — delega ad ai-service, notifica via WebSocket
  wardrobe/         GET /api/v1/gallery (con dati capo embedded), PATCH /gallery/{id}/categoria, POST /gallery/{garmentId}/toggle-favorite (like = salva/rimuovi dal guardaroba)
  sizeadvisor/      GET /api/v1/size-advisor/{garmentId} — confronta misure utente/capo via ai-service
  outfit/           entità/repository/service Outfit (Outfit Builder) — NESSUN controller (non nel contratto MVP)
  social/           POST /api/v1/social/post, POST /api/v1/social/vote (Rate My Outfit / Outfit Battle)
  share/            POST /api/v1/share, GET /api/v1/share/{token} (no-auth, pagina pubblica)
  pricetracker/      POST /api/v1/price-alerts
  payment/          GET /api/v1/payments/plans (no-auth), POST /api/v1/payments/subscribe (mock Stripe)
  client/            AiServiceClient, ScrapingServiceClient — RestClient verso i microservizi Python
  common/            security (JWT), exception handling, config (CORS, WebSocket, OpenAPI, RestClient)
```

## Endpoint pubblici (no JWT)

`POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/share/{token}`,
`GET /api/v1/payments/plans`. Tutto il resto richiede header `Authorization: Bearer <jwt>`.

## Integrazione con ai-service / scraping-service

I client (`client/AiServiceClientImpl`, `client/ScrapingServiceClientImpl`) sono stati
allineati ai contratti REALI implementati nei due servizi Python (non a ipotesi):

- `POST /bodyscan/estimate` (non `/body-scan/estimate`) — richiede `user_id` + `altezza_cm` + `foto_front_url`.
- `POST /tryon/render` → `{job_id, status}`, poi `GET /tryon/render/{jobId}` → `{output_url}`.
  Taglia consigliata e fit score **non** vengono da questa chiamata (ai-service li separa
  in `/size-advisor`): il modulo `sizeadvisor` li recupera a parte.
- `POST /scrape` (non `/scrape/import`) su scraping-service, body `{"url": ...}`.

Se uno dei due servizi non risponde, `UpstreamServiceException` → HTTP 502, l'app non crasha.

## Modello dati

Vedi `src/main/resources/db/migration/V1__init.sql` per lo schema completo (11 tabelle:
users, body_scans, garment_items, price_history, tryon_sessions, wardrobe_items, outfits,
outfit_items, social_posts, shared_links, price_alerts), rispecchia 1:1 il Concept
Document v4.0 sezione 7. `V2__user_unita_misura.sql` aggiunge la colonna
`unita_misura` (cm/in) usata dal profilo (schermata Io).

**Seed dati**: `common/seed/GarmentCatalogSeeder` (idempotente, gira ad ogni avvio via
`CommandLineRunner`, usa le repository JPA invece di SQL raw per funzionare identico su
H2 e Postgres) popola 6 capi demo — stessi nomi/prezzi del prototipo di design — più
uno storico prezzi reale su 3 di essi, cosi' Feed/Prova/Armadio hanno dati veri su cui
lavorare fin dal primo avvio.

## Profili

- **default**: Postgres (host/porta/credenziali da variabili d'ambiente, vedi
  `application.yml` e `infra/docker-compose.yml`), Flyway attivo.
- **dev**: H2 in-memory, `ddl-auto: update` (Flyway disattivato — le migration usano
  sintassi specifica Postgres), console H2 su `/h2-console`. Pensato per sviluppo locale
  senza Docker.

## Test

`AuthServiceTest`, `SizeAdvisorServiceTest` e `UserServiceTest` sono test unitari
Mockito puri (nessun contesto Spring caricato) — scelta deliberata per restare veloci e
poco fragili; il comportamento end-to-end reale (incluso il livello HTTP/JWT/JPA) è
comunque stato verificato avviando il server e chiamandolo con `curl` (vedi sopra).

## TODO / limiti noti

- **Outfit Builder**: solo entità/repository/service, nessun controller REST (fuori dal
  contratto API MVP del Concept Document).
- **Pagamenti**: `PaymentService.subscribe` restituisce un URL di checkout finto: nessuna
  vera integrazione Stripe. Il piano utente andrebbe aggiornato via webhook Stripe dopo
  pagamento confermato, non da questa chiamata.
- **Size chart dei capi**: `GarmentItem.misureTaglieJson` non viene popolato dallo
  scraping-service attuale (che non estrae tabelle taglie): il size-advisor funziona solo
  se questo campo viene valorizzato manualmente o in una futura estensione dello scraping.
