# Font pixel

Questa cartella non è più necessaria: `src/theme/useReflctFonts.ts` carica i 6 pesi
richiesti (Press Start 2P 400, VT323 400, Silkscreen 400/700, Pixelify Sans 600/700)
direttamente dai pacchetti npm `@expo-google-fonts/*` già elencati in `package.json`
— i file `.ttf` sono inclusi nel pacchetto stesso, nessun download manuale richiesto.

Lasciata vuota (o rimovibile) a meno che in futuro si preferisca bundlare file `.ttf`
locali invece delle dipendenze npm (in tal caso, ripristinare i `require()` locali in
`useReflctFonts.ts`).
