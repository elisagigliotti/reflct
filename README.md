# Reflct — Virtual Try-On Platform

Monorepo scaffold generato a partire da due documenti forniti dal committente:

1. **Handoff di design "Y2K tryonfeed"** (`docs/design-reference/`) — prototipo hifi
   in stile **retro-OS Y2K / vaporwave** (finestre stile Windows 9x, desktop menta,
   chrome rosa/teal, font pixel), con 4 schermate definitive: Feed, Prova, Armadio, Io.
2. **Concept Document v4.0** (`docs/concept/`) — visione di prodotto completa: 9
   schermate, feature set (AR try-on, scraping e-commerce, body-scan, social, price
   tracker), architettura tecnica, modello dati, contratto API, roadmap.

I due documenti descrivevano estetiche visive diverse (l'uno "retro-OS", l'altro
"scrapbook/collage crema"). **Decisione presa**: si usa l'estetica/palette dello
handoff retro-OS per **tutte** le 9 schermate del Concept v4.0 — vedi
[`packages/design-tokens/README.md`](packages/design-tokens/README.md) per il
dettaglio della decisione e la spec di reskin delle 5 schermate nuove.

## Struttura del monorepo

```
reflct/
  packages/design-tokens/   fonte di verita' unica: palette, font, bordi/ombre, spec 9 schermate
  apps/web/                 Angular 17 + SCSS (PWA) — le 9 schermate, dati mock
  apps/mobile/              React Native (Expo) + TypeScript — le 9 schermate, dati mock
  backend/api/              Spring Boot 3 / Java 21 — REST API, JWT, JPA/Postgres
  backend/ai-service/       Python FastAPI — body-scan, try-on render, size advisor
  backend/scraping-service/ Python FastAPI — import capo da URL e-commerce (scraping reale)
  infra/                    docker-compose per l'intero stack + nginx reverse proxy
  docs/design-reference/    handoff di design originale (README, screenshot, prototipo HTML)
  docs/concept/             Concept Document v4.0 (PDF + testo estratto)
```

## Stato — tutto buildato e verificato ✅

Node.js LTS (24.18.0) e Apache Maven (3.9.16) sono stati installati su questa macchina
(rispettivamente via winget e download diretto in `C:\tools\`, con Java 21 già presente)
e **ogni parte del monorepo è stata effettivamente compilata/testata**, non solo scritta:

| Parte | Verifica eseguita | Esito |
|---|---|---|
| **Web (Angular)** | `npm install`, `ng build` (dev + produzione con service worker), avviato in browser reale su tutte le schermate principali | ✅ build pulita, rendering verificato (Feed, Prova, Armadio, Io) |
| **Mobile (React Native)** | `npm install`, `tsc --noEmit` (tutte le 9 schermate + componenti) | ✅ nessun errore di tipo |
| **Backend API (Spring Boot)** | `mvn clean package`, `mvn test`, avvio reale + test end-to-end con `curl` | ✅ build pulita, **11/11 test unitari passati** |
| **ai-service (Python)** | `pytest` | ✅ **17/17 test passati** (size advisor reale, body-scan/try-on mock) |
| **scraping-service (Python)** | `pytest` | ✅ **19/19 test passati** (scraping reale via requests+BeautifulSoup) |
| **Infra (Docker Compose)** | non eseguito | Docker non disponibile su questa macchina; file scritti e coerenti, non testati |
| **Auth (login/registrazione/profilo)** | web verificato end-to-end nel browser reale (registrazione → feed → profilo → modifica → reload → logout); mobile verificato con type-check | ✅ **reale, non più mock** |
| **Feed / Prova / Armadio** | web verificato end-to-end nel browser reale (catalogo capi, like/unlike, navigazione, price-drop reale); mobile verificato con type-check | ✅ **reale, non più mock** |
| **Import / Social / Share / Price Tracker** | — | Ancora dati mock locali — prossimo passo (vedi sotto) |

## Login, registrazione e profilo — ora reali

Su richiesta esplicita, questa è la prima parte del prodotto collegata **davvero** al
backend (non più demo):

- **Backend**: nuovo modulo `com.reflct.api.user` — `GET /api/v1/users/me` e
  `PATCH /api/v1/users/me` (nome, altezza, unità di misura), oltre ai già esistenti
  `POST /api/v1/auth/register` e `/login`. Aggiunta colonna `unita_misura` a `users`
  (Flyway `V2__user_unita_misura.sql`).
- **Web**: `AuthService` (Angular signals + HttpClient) con JWT persistito in
  `localStorage`, `authInterceptor` (allega il Bearer token, logout automatico su 401),
  `authGuard`/`guestGuard` sulle route. Nuove schermate `/login` e `/register` (stile
  coerente col resto: `login.exe`/`register.exe`). `Onboarding` ora porta a `/register`
  invece che dritto al Feed. `ProfileComponent` mostra ed edita i dati reali (nome,
  email, altezza, unità di misura), con logout funzionante.
- **Mobile**: stesso schema — `AuthContext` (React Context) con token in
  `expo-secure-store` (più corretto di AsyncStorage per un JWT), `LoginScreen`/
  `RegisterScreen` nuove, `RootNavigator` che monta `MainTabs` oppure
  `Onboarding→Login/Register` a seconda di `isAuthenticated` (pattern idiomatico di
  React Navigation, non un guard per-route). `ProfileScreen` aggiornata allo stesso modo.
- **Rimosso deliberatamente**: le "stats" decorative del profilo (capi provati/look/
  risparmiati) e le misure taglia-top/bottom/scarpe fittizie — non c'è ancora un
  endpoint che le calcoli davvero, e mostrarle avrebbe contraddetto la richiesta di non
  avere più una demo. Restano solo i campi realmente persistiti.

## Feed, Prova e Armadio — ora reali

Stesso principio dell'auth: dati veri dal backend, non più array mock in memoria.
Poiché `FeedStateService`/`AppStateContext` sono la "single source of truth" condivisa
tra queste tre schermate (già così nel design originale), collegare il Feed ha
automaticamente reso reali anche Prova (il capo aperto) e Armadio (la lista salvati).

- **Backend**: nuovo `GET /api/v1/garments` (catalogo paginato, non nel contratto MVP
  originale ma necessario), nuovo `POST /api/v1/gallery/{garmentId}/toggle-favorite`
  (like = salva/rimuovi dal guardaroba — coerente con l'handoff, dove "SALVATI" in
  Armadio conta i capi con like). `WardrobeItemResponse` ora include i dati del capo
  (nome/brand/prezzo/foto) per evitare round-trip aggiuntivi. Un `GarmentCatalogSeeder`
  (idempotente, gira ad ogni avvio) popola 6 capi demo — stessi nomi/prezzi del
  prototipo di design — più uno storico prezzi **reale** su 3 di essi per il badge
  "price drop" (non più un valore finto).
- **Web/Mobile**: `FeedStateService`/`AppStateContext` ora chiamano le API reali;
  `shotColor`/rotazione collage/altezza masonry (puramente presentazionali, mai stati
  pensati per il backend) sono derivati in modo deterministico dall'id del capo lato
  client (`garment-visuals.ts` / `garmentVisuals.ts`), cosi' la stessa card ha sempre lo
  stesso aspetto. Il like è ottimistico (cambia subito, si annulla solo se la chiamata
  fallisce davvero).
- **Semplificazioni deliberate**: i capi reali non hanno ancora "taglia" (badge size) né
  "fit ottimo" (richiederebbe body-scan + size-advisor per ogni card di un feed, troppo
  costoso per una lista) — questi badge sono stati rimossi dalle card con dati reali
  invece di essere inventati. Il filtro (`Per te/Nuovi/Saldi/...`) resta solo visivo per
  ora (nessuna logica di filtro reale lato backend).

Verificato end-to-end nel browser reale: registrazione → Feed con 6 capi reali e
price-drop reale → like su un capo → Armadio mostra "SALVATI: 1" con quel capo →
click sulla card → Prova apre lo stesso capo reale (id UUID nell'URL).

### Bug reali trovati e corretti durante la verifica

Scrivere codice "a occhio" (senza compilatore) in parallelo su più stack porta quasi
sempre a qualche errore — buildare per davvero li ha fatti emergere:

- **`apps/web/angular.json`**: la cartella `public/` a livello di progetto non è
  compatibile col builder classico (`@angular-devkit/build-angular:browser`, non il
  nuovo builder "application"); spostato `manifest.webmanifest` dentro `src/`.
- **`apps/web/angular.json`**: riferimenti a `src/favicon.ico` e `src/assets` mai creati
  — rimossi dalla lista assets (e il link `<link rel="icon">` da `index.html`).
- **`apps/web/angular.json`**: `serviceWorker` deve essere un booleano (`true`) con
  `ngswConfigPath` separato, non una stringa col path del file — altrimenti la build di
  produzione falliva con "Schema validation failed".
- **`apps/web/src/app/app.config.ts`**: `provideZoneChangeDetection({eventCoalescing:
  true})` schedula il change detection su `requestAnimationFrame`, che i browser
  sospendono quando la tab è in background/non visibile — risultato: l'app si "bloccava"
  al primo render (nessuna interpolazione, `@if`/`@for` mai aggiornati). Rimosso
  `eventCoalescing` per usare lo scheduling di default (immediato, non legato alla
  visibilità della tab).
- **`apps/mobile/package.json`**: le versioni `^0.2.3` dei pacchetti
  `@expo-google-fonts/*` non esistono su npm — aggiornate a `^0.4.0` (versioni reali).
- **`apps/mobile/src/theme/useReflctFonts.ts`**: caricava font con `require()` su file
  `.ttf` locali mai scaricati (l'ambiente non permette download di binari) — impediva
  all'app di avviarsi. Passato a caricare i font dai pacchetti npm
  `@expo-google-fonts/*` (già in package.json), che li includono già.
- **`backend/api` — `AuthService.register`**: controllava `existsByEmail` sulla stringa
  email così com'è ricevuta, ma salvava l'utente con l'email normalizzata in minuscolo —
  permetteva potenzialmente doppie registrazioni con maiuscole diverse. Normalizzato
  prima del controllo, non solo prima del salvataggio.
- **`backend/api/client/*`**: i client verso `ai-service`/`scraping-service` erano stati
  scritti indovinando il contratto (i due servizi sono stati costruiti in parallelo da
  un agente diverso, senza vedersi): path sbagliati (`/scrape/import` invece di
  `/scrape`, `/body-scan/estimate` invece di `/bodyscan/estimate`), campo `user_id`
  mancante nella richiesta body-scan, e il flusso try-on assumeva una risposta
  sincrona con taglia/fit-score che in realtà ai-service non fornisce in quell'endpoint
  (li separa in `/size-advisor`). Riallineati ai contratti reali.

## Come avviare ogni parte

### Web (`apps/web`)
```bash
cd apps/web && npm install && npm start   # http://localhost:4200
```

### Mobile (`apps/mobile`)
Font pixel caricati automaticamente via `@expo-google-fonts/*` (nessun download manuale).
Copia `.env.example` in `.env` e imposta `EXPO_PUBLIC_API_URL` (su Android emulator
`localhost` del backend è `10.0.2.2`, non `localhost`).
```bash
cd apps/mobile && npm install && npx expo start
```

### Backend API (`backend/api`)
```bash
cd backend/api && mvn spring-boot:run -Dspring-boot.run.profiles=dev   # H2 in-memory, no Docker
```

### ai-service / scraping-service (`backend/ai-service`, `backend/scraping-service`)
```bash
cd backend/ai-service && python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt && pytest -q && uvicorn app.main:app --reload --port 8001
```
(analogo per `backend/scraping-service`, porta 8002)

### Tutto insieme (`infra/`)
Richiede Docker (non disponibile qui, non testato).
```bash
cd infra && cp .env.example .env && docker compose up --build   # http://localhost:8080
```

## Prossimi passi consigliati

1. Collegare le schermate rimanenti (Import, Social, Share, Price Tracker) alle API
   reali di `backend/api` — oggi usano ancora dati mock locali.
2. Popolare `GarmentItem.misureTaglieJson` (tabella taglie) nello scraping-service o
   altrove, perché il size-advisor funzioni end-to-end (serve anche per ripristinare
   il badge taglia/fit sulle card Feed).
3. Vera integrazione Stripe (oggi `PaymentService.subscribe` è un mock).
4. Bundlare i font pixel localmente sul web (oggi caricati da Google Fonts a runtime,
   accettabile in sviluppo ma non per produzione secondo l'handoff di design).
5. Verificare `infra/docker-compose.yml` con Docker installato.
6. Testare l'app mobile su un vero simulatore/dispositivo (qui verificata solo con
   `tsc --noEmit`, nessun emulatore Android/iOS disponibile in questo ambiente).
