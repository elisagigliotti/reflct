# Reflct — Design Tokens & Spec Schermate (fonte di verità unica)

Questo pacchetto è la fonte di verità condivisa da `apps/web` (Angular) e `apps/mobile`
(React Native). Qualunque altro documento (PDF concept, handoff zip) va riletto attraverso
QUESTO file in caso di conflitto.

## Decisione di design (perché questo file esiste)

Il progetto è nato da due documenti che descrivono due estetiche diverse:

1. **Handoff "Y2K tryonfeed"** (`docs/design-reference/`) — stile **retro-OS Y2K / vaporwave**
   (finestre stile Windows 9x, desktop menta, chrome rosa/teal, font pixel). Definisce 4
   schermate in hifi con CSS/token completi: Feed, Prova, Armadio, Io.
2. **Concept v4.0** (`docs/concept/`) — stile "scrapbook/collage" completamente diverso
   (sfondo crema, font Permanent Marker/Pacifico/Caveat...), con 9 schermate e l'intera
   architettura prodotto (feature set, modello dati, API, roadmap).

**Decisione presa con il committente:** si usa **l'estetica/paletta dell'handoff retro-OS**
per TUTTE le schermate (nessun colore/font "scrapbook" va usato), ma si costruiscono le
**9 schermate** del Concept v4.0, "reskinnando" le 5 nuove con gli stessi componenti
(`.win`, `.btn-95`, `.tab`, `.stamp`, `.size-pill`, `.shot`, `.masonry-2`, `.menubar`,
`.taskbar-item`, `.heart-meter`) e la stessa palette. Il modello dati, il feature-set e le
API restano quelli descritti nel Concept v4.0 (sezioni 4-8), solo la skin visiva cambia.

## Design tokens

Vedi `tokens.json` (valori grezzi), `scss/_tokens.scss` (Angular/web) e `rn/theme.ts`
(React Native). Riassunto:

- **Colori**: desktop `#9FE0CC`/`#7FD4BE` (mint), finestra `#FBDCE8` (rosa)/`#DCF3EC` (menta),
  chrome `#F49AC1`(rosa)/`#6FCBB6`(teal), ink `#2A2438`, ink2 `#5A4E6E`, muted `#8A7FA0`,
  pink `#FF5FA2` (CTA/like), cyan `#4FD3E6` (link/taglia), mint `#2FAF8E` (successo/fit),
  yellow `#F5D14E` (start/evidenzia), lav `#C6A5F2`, warn `#F5A03D` (scarto misura).
- **Font**: `Press Start 2P` (logo/numeri/username, 8-20px), `Silkscreen` 400/700 (chrome/tab/
  badge/taskbar, 7-11px), `VT323` (corpo/prezzi/liste, 14-22px), `Pixelify Sans` 600/700
  (titoli capi/dialog, 15-18px). Font bundlati nell'app (mai Google Fonts a runtime su native).
  `image-rendering: pixelated` sul body web; niente antialias dove serve il look pixel.
- **Bordi/ombre (non derogabili)**: bordo sempre `2px solid $ink`. Ombra **solo offset
  solido, mai blur**: `3px 3px 0 $ink` (finestre/card), `2px 2px 0 $ink` (bottoni/badge).
  Border-radius: 4px finestre/card, 5px folder/swatch, 3px bottoni/tab/badge, 2px title bar.
- **Rotazione collage**: card con `--rot` tra -1.4° e +1.4°, l'hover si compone con la
  rotazione base.
- **Motion**: card hover `translate(-1px,-2px)` + ombra 5px; bottone hover
  `translate(-1px,-1px)`, active `translate(2px,2px)` ombra 0 (premuto); like hover
  `rotate(-4deg) scale(1.08)`; swatch/tab hover `translate(-1px,-1px)`; icona taskbar hover
  `translateY(-2px)`. Transizioni 0.12-0.16s ease. **Nessuna animazione temporizzata/loop.**
- **Spacing**: gap blocchi verticali ~12px, padding finestre 12-13px, masonry column-gap
  12px, griglie folder gap 8px.

## Le 9 schermate

Le prime 4 sono hifi e definitive (vedi `docs/design-reference/README.md` e gli screenshot in
`docs/design-reference/screens/` per il dettaglio pixel-perfect). Le altre 5 sono nuove: qui
sotto la spec di reskin nello stesso linguaggio visivo, da considerare hifi anch'essa.

### 1. Onboarding (`onboarding.exe`) — NUOVA
- Finestra boot: title bar `C:\\reflct\\onboarding.exe`, contenuto centrato.
- Logo `Reflct` (Press Start 2P 22px, `$pink`) con 2-3 glifi `✦` che ruotano leggermente
  attorno (CSS `--rot`, niente animazione infinita: solo stato hover/tap).
- **Griglia 3×3** di mini-finestre `.win` (come le card capo, ma senza prezzo) che mostrano
  outfit segnaposto (placeholder dithered `.shot`), leggero collage con `--rot` alternato,
  in un contenitore con `overflow` e un **gradient fade** verso il basso (dal `$desktop2`
  trasparente a `$desktop2` opaco) per "affondare" la griglia dietro al testo.
- Headline (VT323 20px o Pixelify Sans 700 18px) tipo `Prova vestiti prima di comprarli.`
- Riga di 3 `.stamp` pill: `AR`, `IMPORT`, `SIZE` (colori cyan/mint/lav).
- CTA `.btn-95--cta` full width `INIZIA →`.
- Nota ghost sotto la CTA, bordo tratteggiato, VT323 14px muted: `nessuna carta richiesta`.
- Stato: `step` locale 1..N se si vuole paginare (facoltativo, l'MVP può essere 1 schermata).

### 2. Home / Feed (`home.exe` / `wardrobe.exe`) — HIFI (handoff)
Vedi `docs/design-reference/README.md` sezione "1 · Feed" e screenshot `01-feed.png`.
Nessuna modifica.

### 3. Prova / Try-On AR (`tryon.exe`) — HIFI (handoff) + note AR
Vedi sezione "2 · Prova" e screenshot `02-prova.png`. Aggiunte concettuali dal Concept v4.0
(da rendere come placeholder, non funzionanti):
- Overlay `● REC · AR LIVE` già previsto = badge camera live.
- **Corner marker AR**: 4 angoli tratteggiati `2px dashed $ink` dentro al viewport (il
  prototipo ha già "cornice tratteggiata"), va mantenuta.
- Bottone `↻ RUOTA` = simula toggle fronte/retro (concept: rilevamento rotazione spalle).

### 4. Import Link (`import.exe`) — NUOVA
- Finestra `import.exe — incolla link`.
- **URL bar**: input full width, bordo 2px + ombra 2px 2px 0 ink, placeholder VT323
  `https://…`, bottone `.btn-95--cyan` `ANALIZZA` a destra/sotto.
- Stato loading: bordo tratteggiato pulsante (no timer/animazione continua — solo testo
  `analisi in corso…`).
- **Preview card** capo importato: stessa card `.win win--pop` della masonry Feed, ma
  con `--rot:-0.5deg` fissa, mostrata da sola (no griglia).
- **Size pills** `XS S M L XL`, la taglia consigliata dal size-advisor evidenziata in
  `$pink` con badge `.stamp` `CONSIGLIATA`.
- **Fit box** `.win--mint` con testo mint "vestibilità: ottima" (o warn/rosso a seconda
  del mock).
- CTA `.btn-95--cta` `AGGIUNGI AL GUARDAROBA`.
- Lista "shop popolari" sotto: righe `.row` (icona negozio + nome) stile bigliettino,
  cliccabili per precompilare l'URL (mock: Zara, H&M, ASOS, Zalando…).

### 5. Guardaroba / Armadio (`wardrobe.dat`) — HIFI (handoff)
Vedi sezione "3 · Armadio" e screenshot `03-armadio.png`. Nessuna modifica.

### 6. Battle / Social (`battle.net`) — NUOVA
- Finestra `battle.net — social`, title bar teal.
- **Tab pill** in testa: `Rate` / `Battle` / `Trending` (stile `.tab`, attiva rosa).
- **Rate My Outfit** (tab Rate): card `.win win--pop` con foto outfit (`.shot`), sotto 3
  bottoni emoji quadrati 44px stile "social sticker" (`🔥`/`😐`/`⏭`) con hover
  `rotate(-3deg) scale(1.05)`; contatore voti VT323 accanto a ciascuno.
- **Outfit Battle** (tab Battle): due card `.win` affiancate (A vs B) leggermente
  inclinate in direzioni opposte (`--rot: -1deg` / `+1deg`), scritta `VS` centrale in
  Press Start 2P 16px `$pink`; sotto una **countdown pill** `.stamp` (es. `23:41:02` al
  termine sfida) e una barra di progresso voti (due segmenti colorati pink/cyan che
  sommano 100%, stile `.fitbar` ma a 2 soli segmenti proporzionali); bottone `VOTATO ✓`
  diventa `.btn-95--cta` pieno/disabled dopo il voto.
- **Trending** (tab Trending): masonry-2 di card capo/outfit più votati (riusa `.shot` +
  contatore `🔥 124`).

### 7. Condivisione (`share.exe`) — NUOVA
- Finestra `share.exe — condividi look`.
- Preview look in card `.win win--pop` con `--rot:-0.6deg`.
- **Opzioni link** come righe `.row` stile bigliettino: `Link permanente`, `Link 24h`,
  `Link 7gg`, `Link 30gg`, `Link con PIN` — quella selezionata ha sfondo `$yellow`
  (post-it) invece che rosa.
- Riga URL generato in font `Silkscreen` dentro un box con bordo tratteggiato, bottone
  `COPIA` (`.btn-95--cyan`) accanto.
- **Grid social** 4 bottoni quadrati (WhatsApp/Instagram/TikTok/X, glifi Unicode
  segnaposto `✦ ★ ♥ ◈`), hover `rotate(-3deg) scale(1.05)`.
- CTA `.btn-95--cta` `ESPORTA 9:16`.

### 8. Price Tracker (`pricewatch.sys`) — NUOVA
- Finestra `pricewatch.sys — capi monitorati`.
- Lista righe `.win` (una per capo monitorato): thumbnail `.shot` piccola inclinata
  `--rot:-4deg` a sinistra, a destra nome + brand (come card Feed), prezzo attuale VT323
  `$pink` o `$mint` se in calo, prezzo storico barrato muted.
- **Sparkline**: 8 barre verticali (`div` con altezza proporzionale, niente librerie
  grafiche) colorate ad arcobaleno soft della palette (pink/cyan/mint/yellow/lav in
  sequenza ciclica), dentro un riquadro tratteggiato.
- Badge `.stamp` mint `▼ minimo storico` quando applicabile.
- Riga toggle "Alert" con soglia prezzo (`.row` con input numerico piccolo + `.btn-95`
  `IMPOSTA`).

### 9. Profilo / Io (`profile.sys` / `measures.cfg` / `settings.ini`) — HIFI (handoff)
Vedi sezione "4 · Io" e screenshot `04-io.png`. Aggiunte dal Concept v4.0 (comunque nello
stesso linguaggio visivo):
- **Badge Premium** `.stamp` giallo accanto a `giulia_` se `plan !== 'FREE'`.
- **Stats** riga con 3 numeri Press Start 2P colore `$pink` (es. capi provati, look,
  risparmiato €) sopra `measures.cfg`, stile le 3 stat-card di Armadio ma compatte.

## Componenti riusabili (nomi classe canonici, usare gli stessi in web e mobile)
`win` (+`--mint`,`--pop`), `win-title` (+`--teal`), `win-btns`, `btn-95`
(+`--cta`,`--cyan`,`--yellow`,`--block`), `tab`, `stamp`, `size-pill`, `swatch`, `fitbar`,
`row` (+`__k`,`__v`), `folder`, `masonry-2`, `filter-strip`, `heart-meter`, `taskbar-item`,
`shot` (+`__tag`), `menubar`.

## Nav (taskbar / tab bar)
4 tab persistenti: `Feed` 🖥, `Prova` 🪞, `Armadio` 🗄, `Io` 💾. Le altre 5 schermate
(Onboarding, Import, Battle/Social, Share, Price Tracker) si raggiungono da entry point
dentro le 4 principali (es. Import da un `+` nel Feed, Battle/Social da un tab dentro
Feed o icona nel menubar, Share dal dettaglio Prova/Armadio, Price Tracker da Armadio),
NON occupano slot taskbar aggiuntivi — coerente con "4 tab principali" del handoff.
Onboarding è la prima route (`/onboarding`), mostrata solo pre-login/prima volta.

## Asset
Nessuna immagine reale: scatti prodotto e viewport avatar sono placeholder dithered CSS
(classe `.shot`, gradiente diagonale). Icone sono glifi Unicode/emoji segnaposto. In
produzione andranno sostituiti con foto reali / feed camera / icon-set pixel coerente —
fuori scope per questo scaffold.
