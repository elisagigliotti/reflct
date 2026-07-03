# Handoff: Reflct — App completa (stile Retro-OS Y2K / Vaporwave)

## Overview
Reflct è una piattaforma di **virtual try-on** per abbigliamento. Questo pacchetto documenta
**l'intera app mobile** in un unico prototipo interattivo navigabile con 4 schermate:

1. **Feed** — saluto, invito body-scan, filtri, griglia masonry dei capi.
2. **Prova** — cabina di prova / virtual try-on sull'avatar (AR), fit-meter, selettore taglia/colore.
3. **Armadio** — guardaroba: statistiche, cartelle, capi salvati.
4. **Io** — profilo: avatar, misure corpo, impostazioni, re-scan.

La navigazione avviene dalla **taskbar** in basso (Feed / Prova / Armadio / Io) che cambia
davvero schermata. Il click su un capo nel Feed apre la schermata **Prova** con quel capo.

Estetica: **retro-OS Y2K / vaporwave** — desktop menta con griglia, finestre rosa pastello con
title bar stile Windows 9x, font pixel, bordi neri solidi e ombre a offset pieno (mai blur).

## Deve girare come SITO WEB + APP iOS + APP ANDROID
Il design è **mobile-first a 390px** ma va consegnato su 3 target. Indicazioni:

- **Web (responsive):** il layout a 390px è la colonna "mobile". Su viewport più larghi mantenere
  la colonna centrata max ~420px (l'app È un mockup di sistema, non deve stirarsi) OPPURE, per
  una vera esperienza desktop, trasformare le schermate in **finestre trascinabili sul desktop**
  (il pattern OS è già suggerito dalle title bar: su desktop le finestre possono affiancarsi).
  Consiglio pragmatico per l'MVP: **colonna centrata 390–420px** con lo sfondo desktop che riempie
  il resto della viewport. PWA installabile per l'esperienza "app".
- **iOS / Android (native o cross-platform):** consigliato **React Native / Expo** o **Flutter**
  per condividere il codice; in alternativa native (SwiftUI / Jetpack Compose). Il look pixel/OS
  è puramente visivo: si ottiene con gli stessi token colore, i font pixel come font bundled, e
  container con bordo 2px + ombra a offset pieno. Vedi "Adattamenti per piattaforma".

### Adattamenti per piattaforma (fondamentali)
- **Safe areas:** su iOS/Android rispettare notch e home-indicator. La **taskbar** va ancorata
  in fondo *sopra* la safe-area inferiore (`env(safe-area-inset-bottom)` sul web / `SafeAreaView`
  su RN). Il menu bar superiore va sotto la status-bar di sistema.
- **La taskbar = tab bar nativa.** I 4 item (Feed/Prova/Armadio/Io) sono le tab principali. Su
  native usare la tab-bar della piattaforma ma **skinnata** con lo stile OS (fondo rosa `#FBDCE8`,
  bordo-top nero, icone in riquadro). Il bottone START e l'orologio sono decorativi: su mobile
  nativo si possono togliere o ridurre (l'orologio può diventare quello reale di sistema).
- **Font pixel:** `Press Start 2P`, `VT323`, `Silkscreen`, `Pixelify Sans` vanno **bundlati**
  nell'app (non caricati da Google Fonts a runtime su native). Impostare `image-rendering:
  pixelated` (web) / disattivare l'antialias dove serve per il look pixel.
- **Body-scan (Prova/Io):** su native sfrutta la **fotocamera + ARKit (iOS) / ARCore (Android)**
  per il vero try-on; sul web è un placeholder (o WebXR dove supportato). Il viewport avatar nel
  prototipo (area dithered "AVATAR_LIVE.CAM") è il segnaposto del feed camera/render 3D.
- **Gesti:** tap ovunque; su mobile la filter-strip e le griglie sono scrollabili in orizzontale/
  verticale. Prevedere hit-target ≥44px (i bottoni sono già ≥34–46px, verificare i cuori/badge).
- **Hover:** gli stati hover valgono su web/desktop; su touch mappare l'equivalente su
  **press/active** (l'effetto "premuto" dei bottoni è già definito su `:active`).

## About the Design Files
Il file `Reflct App.dc.html` è un **riferimento di design creato in HTML** — un prototipo
che mostra look & comportamento, **non** codice di produzione da copiare. Il compito è
**ricreare questo design nell'ambiente target** (Web: es. Angular+SCSS come richiesto, o React;
Mobile: React Native/Flutter/native) usando i pattern e le librerie del codebase.

> Il file HTML usa una sintassi a template a componente (`<sc-for>`→ciclo, `<sc-if>`→condizione,
> `{{ }}`→interpolation, `onClick="{{ }}"`→handler) più una classe logica JS `Component`.
> È solo riferimento: tradurre nei costrutti del framework scelto (`*ngFor`/`*ngIf` in Angular,
> `.map()`/`&&` in React, ecc.). NON portare quella sintassi in produzione.

## Fidelity
**High-fidelity (hifi).** Colori, tipografia, spaziatura, bordi, ombre e interazioni sono
definitivi. Ricreare la UI pixel-perfect con le librerie/pattern del codebase.

---

## Screens / Views

### 1 · Feed
- **Purpose**: ingresso. Saluto, invito body-scan, filtri, sfoglio capi, like, apertura prova.
- **Layout** (viewport 390px, container centrato bordato, padding `10px 12px 92px`):
  - **Menu bar OS** (persistente): logo `Reflct` (Press Start 2P 9px `#FF5FA2`), voci di menu
    contestuali per schermata (Feed: `File Fit View`), data `▚ 1999/05/23` a destra.
  - **Finestra saluto** `home.exe`: `> bentornata,` (VT323 17px `#5A4E6E`), `giulia_`
    (Press Start 2P 20px, underscore `#FF5FA2`), badge `avatar: ON` + `42 capi provati questo mese`.
  - **Dialog body-scan** `system message` (title bar teal, `×` chiude): icona cuore, titolo
    `Crea il tuo avatar 3D` (Pixelify Sans 700 18px), testo, heart-meter (♥♥♥♥♡♡ multicolore),
    bottoni `SCAN NOW` (CTA rosa → va a Prova) + `Later` (chiude).
  - **Finestra `wardrobe.exe`**: filter-strip (`Per te, Nuovi, Saldi, Denim, Vestiti, Vintage`,
    attiva rosa) + **masonry 2 col** di card-capo.
- **Card capo** (mini-finestra, ripetuta, cliccabile → Prova): mini title bar col nome file `×`;
  scatto dithered (placeholder, altezza 118–190px, tinta per capo); badge taglia (cyan) in alto-dx;
  cuore toggle in alto-sx; nome (Pixelify Sans 600 15px), brand (Silkscreen 8px), prezzo (VT323 22px),
  prezzo vecchio barrato + stamp `▼ price drop` (mint), nota `✓ fit ottimo` (mint). Rotazione
  collage `--rot` da -1.4° a +1.4°.

### 2 · Prova (virtual try-on)
- **Purpose**: provare il capo selezionato sull'avatar, regolare taglia/colore, salvare/acquistare.
- **Layout** finestra `tryon.exe — cabina di prova`:
  - **Viewport avatar** 300px: area dithered rosa (placeholder del feed camera/render 3D), overlay
    `● REC · AR LIVE` e `AVATAR_LIVE.CAM` (stamp), cornice tratteggiata (marker AR), etichetta capo
    indossato in basso (nome del capo, Pixelify Sans su targhetta).
  - **Fit score**: `Fit sul tuo avatar` + `92%` (Press Start 2P mint), **fitbar** 10 segmenti
    (riempiti mint in proporzione).
  - **Readout misure** (finestra menta): `spalle PERFETTO` (mint), `vita OK` (mint),
    `lunghezza -2 cm` (arancio `#F5A03D`).
  - **Selettore taglia**: pill `XS S M L XL` (attiva rosa).
  - **Selettore colore**: 5 swatch `#FF5FA2 #4FD3E6 #2FAF8E #F5D14E #C6A5F2` (attivo con outline).
  - **Azioni**: `↻ RUOTA` (cyan) + `♥/♡ SALVA` (toggle like) ; CTA block `AGGIUNGI · €79`.

### 3 · Armadio (guardaroba)
- **Purpose**: capi salvati, look, cartelle, statistiche.
- **Layout** finestra `wardrobe.dat — il mio armadio`:
  - **3 stat card**: `SALVATI` (conteggio reale dei like, rosa), `LOOK` (7, mint), `PROVATI` (42, cyan).
  - **Cartelle** griglia 3 col: `ESTATE 12`, `LAVORO 8`, `FESTA 5` (icona 📁, Silkscreen).
  - Finestra `salvati.lst`: **masonry 2 col** dei capi con like attivo (scatto dithered, cuore pieno
    rosa = rimuovi, nome + prezzo). **Empty state**: `nessun capo salvato — metti ♥ nel feed!`.

### 4 · Io (profilo)
- **Purpose**: identità, misure avatar, impostazioni, re-scan.
- **Layout**:
  - Finestra `profile.sys`: avatar pixel placeholder 66px (viola dithered), `giulia_`, `@giulia.exe · dal 1999`,
    stamp `avatar aggiornato · 2gg fa` (mint).
  - Finestra `measures.cfg` (menta): righe `altezza 168 cm`, `taglia top M` (cyan),
    `taglia bottom S/27` (cyan), `scarpe 38 EU`; bottone block `↻ RIFAI IL BODY-SCAN` (cyan → Prova).
  - Finestra `settings.ini`: righe lista `🔔 Notifiche ›`, `🔒 Privacy & avatar ›`,
    `📏 Unità di misura cm ·`, `❔ Aiuto ›`.
  - **Social sticker**: 3 bottoni quadrati 44px (`★` cyan, `♥` rosa, `✦` giallo), hover rotazione sticker.

---

## Interactions & Behavior
- **Nav taskbar**: imposta la schermata attiva (`tab`). Persistente su tutte le schermate.
- **Feed → Prova**: click su una card capo apre Prova con quel capo (`tryItemId`).
- **Body-scan CTA** (`SCAN NOW` nel Feed, `RIFAI IL BODY-SCAN` in Io): vanno a Prova (in prod:
  avvia flusso fotocamera/AR).
- **Filtri**: selezione singola; nel prototipo solo stile attivo (in prod filtrare la lista).
- **Like**: toggle su cuore (Feed, Prova, Armadio). `stopPropagation` sul cuore nel Feed per non
  aprire la card. Lo stato like alimenta conteggio `SALVATI` e lista Armadio (single source of truth).
- **Prova**: selettore taglia e colore aggiornano lo stato (in prod: rirender del render 3D + prezzo/stock).
- **Dialog body-scan**: `×` / `Later` → `banner=false` (scompare).
- **Hover / active**: card `.win--pop` hover `translate(-1px,-2px)`+ombra 5px (compone con `--rot`);
  bottoni `.btn-95` hover `translate(-1px,-1px)`, active `translate(2px,2px)` ombra 0 (premuto);
  like hover `rotate(-4deg) scale(1.08)`; swatch/tab hover `translate(-1px,-1px)`; icona taskbar
  hover `translateY(-2px)`. Transizioni 0.12–0.16s ease. **Nessuna animazione temporizzata.**

## State Management
- `banner: boolean` — dialog body-scan (default true).
- `filter: string` — filtro attivo (default `'Per te'`).
- `tab: 'Feed'|'Prova'|'Armadio'|'Io'` — schermata attiva (default `'Feed'`).
- `liked: { [id]: boolean }` — capi salvati (default `{2:true,4:true}`). Alimenta Armadio + conteggi.
- `tryItemId: number` — capo in prova (default 1).
- `trySize: string` — taglia selezionata in Prova (default `'M'`).
- `tryColor: number` — indice colore selezionato in Prova (default 0).
- Dati: array `FEED` di `FeedItem {id,name,brand,size,price,old,h,rot,fit,shotColor,shotLabel}`;
  in prod servito da API/service.

## Design Tokens

**Colori (SCSS/RN theme):**
```
$desktop:  #9FE0CC;  $desktop2: #7FD4BE;  // sfondo desktop menta / griglia
$win:      #FBDCE8;  $win-alt:  #DCF3EC;  // corpo finestra rosa / menta chiaro
$chrome:   #F49AC1;  $chrome2:  #6FCBB6;  // title bar rosa / teal
$ink:      #2A2438;  $ink2:     #5A4E6E;  $muted: #8A7FA0;  // testo/bordo
$pink:     #FF5FA2;  // CTA / like
$cyan:     #4FD3E6;  // link / taglia
$mint:     #2FAF8E;  // successo / price drop / fit
$yellow:   #F5D14E;  // start / evidenzia
$lav:      #C6A5F2;  // accento lavanda
$warn:     #F5A03D;  // scarto misura (es. -2cm)
```

**Bordi / Ombre (non derogabili):**
- Bordo: sempre `2px solid $ink` su finestre, card, bottoni, badge, campi.
- Ombra: `3px 3px 0 $ink` (finestre/card), `2px 2px 0` (bottoni/badge). **Solo offset solido, MAI blur.**
- Border-radius: 4px finestre/card, 5px folder/swatch, 3px bottoni/tab/badge, 2px title bar.
- Rotazione collage card via CSS var `--rot` (-1.4°…+1.4°) così l'hover si compone.

**Tipografia (Google Fonts / bundle):**
- `Press Start 2P` — logo, nome utente, numeri grandi/percentuali. 8–20px.
- `Silkscreen` (400/700) — chrome, tab, badge, brand, taskbar, valori lista. 7–11px.
- `VT323` — body, prezzi, righe lista, orologio. 14–22px.
- `Pixelify Sans` (600/700) — titoli capi, titoli dialog, label sezione. 15–18px.
- `image-rendering: pixelated` sul body; smoothing off per il look pixel.

**Spacing:** blocchi verticali gap ~12px; padding finestre 12–13px; masonry column-gap 12px;
griglie folder gap 8px.

## Assets
- **Nessuna immagine reale.** Gli scatti prodotto (Feed/Armadio) e il viewport avatar (Prova) sono
  **placeholder dithered** in CSS con etichetta `*.BMP` / `AVATAR_LIVE.CAM`. In produzione:
  sostituire con foto/anteprime capo reali e con il feed camera/render 3D del try-on.
- **Icone/glifi** (`♥ ◈ ✦ ★ ▼ 📁 🔔 🔒 📏 ❔ 🖥 🪞 🗄 💾 ☻`) sono Unicode/emoji segnaposto. In prod
  sostituire con un set di icone pixel coerente (sprite/icon-font retro) per resa e accessibilità.
- **Immagini di riferimento** fornite dal committente (moodboard Y2K/vaporwave, moon-faces, sticker):
  servono SOLO come riferimento estetico (palette + vibe), **non** vanno inserite nell'app.

## Files
- `Reflct App.dc.html` — prototipo completo, 4 schermate navigabili (template + logica +
  tutti i CSS dei componenti riusabili, commentati per il porting).
- `screens/` — screenshot PNG delle 4 schermate (01-feed, 02-prova, 03-armadio, 04-io).

### Componenti riusabili (già isolati e commentati nel file)
`.win` (+ `--mint`,`--pop`), `.win-title` (+ `--teal`), `.win-btns`, `.btn-95`
(+ `--cta/--cyan/--yellow/--block`), `.tab`, `.stamp`, `.size-pill`, `.swatch`, `.fitbar`,
`.row` (+`__k`,`__v`), `.folder`, `.masonry-2`, `.filter-strip`, `.heart-meter`, `.taskbar-item`,
`.shot` (+`__tag`), `.menubar`, `.h-pix`, `.label-hand`.
