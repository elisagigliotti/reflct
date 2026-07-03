/**
 * Hook di caricamento font pixel bundlati con expo-font, usando i pacchetti
 * @expo-google-fonts/* gia' elencati in package.json — i .ttf sono inclusi nel
 * pacchetto npm stesso, nessun download manuale necessario per far partire l'app.
 * NON caricati da Google Fonts a runtime: sono asset bundlati nel binario, come
 * richiesto dall'handoff design (docs/design-reference/README.md).
 */
import { useFonts } from 'expo-font';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { VT323_400Regular } from '@expo-google-fonts/vt323';
import { Silkscreen_400Regular, Silkscreen_700Bold } from '@expo-google-fonts/silkscreen';
import { PixelifySans_600SemiBold, PixelifySans_700Bold } from '@expo-google-fonts/pixelify-sans';

export function useReflctFonts() {
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
    VT323_400Regular,
    Silkscreen_400Regular,
    Silkscreen_700Bold,
    PixelifySans_600SemiBold,
    PixelifySans_700Bold,
  });

  return fontsLoaded;
}
