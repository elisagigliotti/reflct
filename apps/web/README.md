# Reflct — Web (Angular 17 + SCSS)

PWA mobile-first che ricrea l'estetica **retro-OS Y2K / vaporwave** dell'handoff di design,
con le 9 schermate del prodotto (Concept v4.0). Fonte di verità del design:
[`packages/design-tokens`](../../packages/design-tokens/README.md).

## Prerequisiti

Richiede [Node.js LTS](https://nodejs.org/) (≥ 18.19).

```bash
cd apps/web
npm install
npm start   # http://localhost:4200
```

**Build verificata**: `npm install`, `ng build` (dev e produzione con service worker) e
avvio reale in browser sono stati eseguiti con successo su questa macchina — tutte le 9
schermate renderizzano correttamente con dati mock. Durante la verifica sono stati
corretti alcuni bug reali (vedi il README principale del monorepo, sezione "Bug reali
trovati e corretti"): config assets di `angular.json` incompatibile col builder classico,
`serviceWorker` nello schema sbagliato, e `eventCoalescing:true` che bloccava il change
detection quando la tab del browser non è visibile.

## Struttura

```
src/
  environments/            environment.ts (dev, http://localhost:8080/api/v1) / environment.prod.ts (/api/v1, dietro nginx)
  app/
    app.component.*        shell: menubar OS + <router-outlet> + taskbar (4 tab)
    app.routes.ts           routing lazy-loaded, authGuard/guestGuard sulle route
    app.config.ts           bootstrap standalone (provideRouter, HttpClient+interceptor, APP_INITIALIZER ripristino sessione)
    core/auth/              AuthService (JWT reale), authInterceptor, authGuard/guestGuard, models
    core/garments/          GarmentsService (HttpClient reale: lista capi, toggle-favorite, guardaroba), models
    core/state/             FeedStateService (dati REALI, condiviso Feed/Prova/Armadio) + service mock per Import/Social/Share/PriceTracker
    shared/data/            modelli TS, mock data residui, garment-visuals.ts (shotColor/rot/h derivati dall'id)
    shared/ui/              componenti riusabili: ui-window, win-title, btn95, tab, stamp,
                            size-pill, shot, swatch, fitbar, folder, masonry, row, feed-card
    features/
      onboarding/  login/  register/  feed/  tryon/  wardrobe/  profile/  import/  social/
      share/  price-tracker/
```

## Schermate

| Route | Componente | Auth | Origine |
|---|---|---|---|
| `/onboarding` | OnboardingComponent | pubblica | Concept v4.0 (nuova, reskin retro-OS) |
| `/login` | LoginComponent | solo ospiti | nuova — non nell'handoff originale |
| `/register` | RegisterComponent | solo ospiti | nuova — non nell'handoff originale |
| `/feed` | FeedComponent | richiesta | Handoff hifi — dati **reali** dal backend |
| `/prova`, `/prova/:id` | TryonComponent | richiesta | Handoff hifi — dati **reali** dal backend |
| `/armadio` | WardrobeComponent | richiesta | Handoff hifi — dati **reali** dal backend |
| `/io` | ProfileComponent | richiesta | Handoff hifi — dati **reali** dal backend |
| `/import` | ImportComponent | richiesta | Concept v4.0 (nuova, reskin retro-OS) |
| `/social` | SocialComponent | richiesta | Concept v4.0 (nuova, reskin retro-OS) |
| `/share` | ShareComponent | richiesta | Concept v4.0 (nuova, reskin retro-OS) |
| `/price-tracker` | PriceTrackerComponent | richiesta | Concept v4.0 (nuova, reskin retro-OS) — dati **reali** |
| `/scan` | ScanComponent | richiesta | Concept v4.0 sez. 5.3 (nuova) — dati **reali**, raggiungibile solo dal menu ◈ START o dal banner "SCAN NOW" in Feed |

**Navigazione**: la taskbar in basso ha solo Feed/Prova/Armadio/Io (come nell'handoff
originale). Import, Social, Share, Price Tracker e Scan si aprono dal menu **◈ START**
nella menubar in alto — altrimenti erano raggiungibili solo digitando l'URL a mano.

Dettaglio di ciascuna in [`packages/design-tokens/README.md`](../../packages/design-tokens/README.md).

## Autenticazione (reale, non mock)

`core/auth/auth.service.ts` parla con `backend/api` (`POST /auth/register`, `/login`,
`GET`/`PATCH /users/me`). JWT persistito in `localStorage`; `authInterceptor` allega
`Authorization: Bearer <token>` a ogni richiesta verso `environment.apiUrl` e forza il
logout su 401. `authGuard` protegge le schermate principali, `guestGuard` tiene lontano
chi è già loggato da `/login`/`/register`. Un `APP_INITIALIZER` prova a ripristinare la
sessione all'avvio (token salvato → `GET /users/me`) prima di renderizzare le route
protette, per evitare un flash verso `/login`.

Verificato end-to-end in un browser reale: registrazione → redirect a `/feed` →
`/io` con dati reali → modifica profilo (persistita, sopravvive al reload) → logout.

## Feed / Prova / Armadio (reale, non mock)

`core/state/feed-state.service.ts` chiama `GarmentsService` (`GET /api/v1/garments`,
`POST /api/v1/gallery/{id}/toggle-favorite`) invece di usare l'array mock — resta
comunque la "single source of truth" condivisa tra le tre schermate, quindi
collegarla ha reso reali anche Prova (capo aperto) e Armadio (lista salvati) senza
altre modifiche. Il like è ottimistico (cambia subito, si annulla se la chiamata
fallisce). `garment-visuals.ts` deriva `shotColor`/rotazione/altezza masonry in modo
deterministico dall'id del capo (dati puramente presentazionali, mai pensati per il
backend). Badge taglia/fit non compaiono sulle card reali (richiederebbero
size-advisor per ogni item di una lista — semplificazione deliberata).

Verificato end-to-end in un browser reale: 6 capi reali con price-drop reale su 3 di
essi → like → Armadio mostra "SALVATI: 1" → click sulla card → Prova apre lo stesso
capo reale (UUID nell'URL).

## Design tokens

I token (colori, font, bordi/ombre, spacing) vivono in **un solo posto**:
[`packages/design-tokens/scss/_tokens.scss`](../../packages/design-tokens/scss/_tokens.scss),
importato in ogni file `.scss` con:

```scss
@use 'tokens' as t;
```

risolto tramite `angular.json` → `stylePreprocessorOptions.includePaths`.

**Nota importante sull'incapsulamento stile**: le classi base (`.win`, `.btn-95`, `.tab`,
`.stamp`, `.shot`, `.folder`, `.masonry-2`, ecc.) sono definite **sia** nei componenti
wrapper (`shared/ui/*`) **sia globalmente** in `src/styles.scss`. Questo perché molte
schermate applicano quei nomi classe direttamente su `<div>`/`<button>` nativi (come nel
prototipo HTML originale), non solo tramite i componenti Angular — e l'incapsulamento
stile di default di Angular non farebbe "trapelare" le regole scoped di un componente
verso il markup di un altro. Se aggiungi un nuovo componente riusabile, valuta se serve
anche una versione globale in `styles.scss`.

## Stato / dati mock

**Tutte le schermate sono ormai collegate a dati reali**: Login, registrazione,
profilo, Feed, Prova (incluso fit/taglia consigliata via size-advisor), Armadio,
Price Tracker, Import, Scan, Social e Share. Import delega a `scraping-service`
(fetch HTTP reale + parsing HTML: fallisce con un errore reale se l'URL non è una
pagina prodotto valida), Scan delega ad `ai-service` (pose detection reale, non più
mock — vedi `backend/ai-service/README.md`). Nessuna schermata usa più array di dati
finti in-memory.

## Social e Share (reale, non mock)

Entrambi referenziano una `TryOnSession` reale (Concept v4.0 sez. 5.5/5.6): dato che
non c'è ancora un flusso "prova → salva sessione" persistente in UI, `ShareStateService`
e `SocialStateService` ne creano una al volo (`POST /api/v1/tryon/start`) con una foto
segnaposto (nessuna cattura fotocamera reale in questo scaffold), poi creano il
link/post vero (`POST /api/v1/share`, `POST /api/v1/social/post`). Limite noto del
modello dati backend: un post BATTLE rappresenta un solo capo con due opzioni di voto
generiche "a"/"b" (non due capi affiancati con foto distinte) — la UI riflette questo
invece di inventare un secondo capo che il backend non traccia.

## Body Scan (reale, non mock)

`core/state/body-scan-state.service.ts` chiama `POST /api/v1/body-scan` (che delega ad
ai-service `/bodyscan/estimate`) e `GET /api/v1/body-scan/me`. Niente upload foto reale
in questo scaffold (richiederebbe storage tipo MinIO): l'utente incolla l'URL della
foto frontale, stesso pattern già usato in Import Link. Le 7 misure corporee restituite
alimentano anche `User.misureJson`, usato dal size-advisor.

## Price Tracker (reale, non mock)

`core/state/price-tracker-state.service.ts` mostra solo i capi con almeno uno storico
prezzo reale (`GET /api/v1/garments`, filtrati su `prezzoPrecedente != null`), con
sparkline reale da `GET /api/v1/garments/{id}/price-history` e soglie alert persistite
via `GET`/`POST /api/v1/price-alerts`.

## TODO / limiti noti

- **Font pixel** (Press Start 2P, VT323, Silkscreen, Pixelify Sans): caricati da Google
  Fonts via `<link>` in `index.html` per comodità di sviluppo. In produzione vanno
  bundlati localmente (vedi commento in `index.html`).
- **AR / body-scan**: la cattura foto è solo un campo URL (nessun accesso reale alla
  fotocamera/WebXR); la stima delle misure invece è reale (vedi sopra).
- **Social/Share**: restano mock locale — prossimo passo naturale.
- **Taglia/fit sulle card Feed**: rimossi per i dati reali (richiederebbero size-advisor
  per ogni item di una lista, troppo costoso) — vedi sezione "Feed / Prova / Armadio".
- **Login/Register**: schermate nuove, non presenti nell'handoff di design originale —
  reskin coerente nello stesso linguaggio visivo (`login.exe`/`register.exe`).
