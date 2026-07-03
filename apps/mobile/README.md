# Reflct — Mobile (React Native / Expo)

App mobile (iOS/Android) che ricrea l'estetica **retro-OS Y2K / vaporwave** dell'handoff
di design, con le 9 schermate del prodotto (Concept v4.0). Fonte di verità del design:
[`packages/design-tokens`](../../packages/design-tokens/README.md) (in particolare
`rn/theme.ts` per i valori già in TypeScript).

## Prerequisiti

Richiede [Node.js LTS](https://nodejs.org/) (≥ 18.19).

```bash
cd apps/mobile
cp .env.example .env   # imposta EXPO_PUBLIC_API_URL (vedi note dentro il file)
npm install
npx expo start   # scansiona il QR code con Expo Go, o premi i/a per simulatore/emulatore
```

**Verificato**: `npm install` e `tsc --noEmit` (type-check completo di tutte le 9
schermate) sono stati eseguiti con successo su questa macchina, senza errori. Durante
la verifica sono emersi e sono stati corretti due bug reali: le versioni dei pacchetti
`@expo-google-fonts/*` in `package.json` non esistevano su npm (corrette da `^0.2.3` a
`^0.4.0`), e `useReflctFonts.ts` caricava font con `require()` su file `.ttf` locali mai
scaricati — cosa che avrebbe impedito all'app di avviarsi. Ora carica i font
direttamente dai pacchetti npm `@expo-google-fonts/*` (nessun download manuale
necessario). Non è stato possibile testare l'avvio reale su simulatore/dispositivo
(serve Xcode/Android Studio o Expo Go, non disponibili in questo ambiente).

## Struttura

```
App.tsx                     entry point: font (useReflctFonts) + AuthProvider + AppStateProvider + RootNavigator
src/
  api/
    client.ts                fetch + token expo-secure-store, models.ts (DTO auth/user)
    garments.ts               GarmentsService reale: listGarments, toggleFavorite, getGallery
  theme/                     re-export di packages/design-tokens/rn/theme + useReflctFonts (caricamento font)
  ui/                        componenti riusabili: UiWindow, WinTitle, Btn95, Tab, Stamp, SizePill,
                             Shot, Swatch, Fitbar, TaskbarIcon, Folder, Masonry2, Row, Menubar, DesktopBackground
  data/                      modelli TS, mock data residui (Import/Social/Share/PriceTracker),
                             garmentVisuals.ts (shotColor/rot/h derivati dall'id, come sul web)
  state/
    AuthContext.tsx          sessione reale (register/login/logout/updateMe) contro backend/api
    AppStateContext.tsx      feed/like REALI (GET /garments, POST toggle-favorite) + mock locali residui
  navigation/                RootNavigator: Onboarding→Login/Register se non autenticato, MainTabs se sì
  screens/
    auth/                    LoginScreen, RegisterScreen (nuove, non nell'handoff originale)
    OnboardingScreen, feed/, tryon/, wardrobe/, profile/, import/, social/, share/, priceTracker/
```

## Autenticazione (reale, non mock)

`src/state/AuthContext.tsx` parla con `backend/api` (`POST /auth/register`, `/login`,
`GET`/`PATCH /users/me`). Token JWT in `expo-secure-store` (più corretto di
AsyncStorage per un token di sessione). `RootNavigator` monta `MainTabs` se
`isAuthenticated`, altrimenti `Onboarding → Login/Register` — pattern idiomatico di
React Navigation (conditional rendering dei figli del Navigator), non un guard
per-route come sul web. `ProfileScreen` mostra ed edita i dati reali, con logout.

Verificato solo con `tsc --noEmit` (nessun simulatore/emulatore disponibile in questo
ambiente) — la logica rispecchia 1:1 quella web, già verificata end-to-end in browser.

## Feed / Prova / Armadio (reale, non mock)

`AppStateContext` chiama `src/api/garments.ts` (`GET /api/v1/garments`,
`POST /api/v1/gallery/{id}/toggle-favorite`) invece dell'array mock `FEED`, ma solo
**dopo** che `isAuthenticated` diventa vero (altrimenti le schermate di login/register,
montate comunque dentro lo stesso Provider, farebbero una chiamata senza token). Stesso
schema del web: like ottimistico, `garmentVisuals.ts` deriva `shotColor`/rotazione/
altezza in modo deterministico dall'id (dati puramente presentazionali). Badge taglia
nascosto quando assente (`item.size` opzionale). Import/Social/Share/Price Tracker
continuano a usare l'array mock `FEED` invariato.

## Font pixel

Caricati via `expo-font` dai pacchetti npm `@expo-google-fonts/*` (già in
`package.json`) — **nessun download manuale richiesto**, i `.ttf` sono inclusi nel
pacchetto stesso. Vedi `src/theme/useReflctFonts.ts`.

## Differenze rispetto al design web

- **Ombre**: React Native non ha un equivalente nativo di `box-shadow` a offset
  solido; è simulata con una view assoluta traslata dietro al contenuto (vedi
  `UiWindow`/`Btn95`), mai con `shadowOpacity`/`elevation` sfumati.
- **Hover → press**: gli stati hover del web diventano `onPressIn`/stile "premuto".
- **Safe area**: gestita con `react-native-safe-area-context` (notch/home-indicator).
- **AR/body-scan**: solo placeholder visivo, nessuna vera integrazione camera/ARKit/ARCore.

## Stato / dati mock

**Login, registrazione, profilo, Feed, Prova e Armadio sono reali** (vedi sopra).
Import, Social, Share, Price Tracker restano mock: dati in-memory, nessuna chiamata di
rete verso `backend/api`/`backend/ai-service`/`backend/scraping-service`.

## TODO / limiti noti

- **Nessun avvio reale su simulatore/dispositivo verificato** (serve Xcode/Android
  Studio/Expo Go, non disponibili in questo ambiente) — solo `npm install` + type-check.
- **AR / body-scan**: solo placeholder dithered, nessuna vera fotocamera/AR.
- **Import/Social/Share/Price Tracker**: restano mock locale — prossimo passo naturale.
- **Taglia/fit sulle card Feed**: rimossi per i dati reali (richiederebbero size-advisor
  per ogni item di una lista, troppo costoso).
