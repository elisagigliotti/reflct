import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useReflctFonts } from './src/theme/useReflctFonts';
import { AppStateProvider } from './src/state/AppStateContext';
import { AuthProvider } from './src/state/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  // no-op: safe se già chiamato o non disponibile (es. web)
});

export default function App() {
  const fontsLoaded = useReflctFonts();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    // Nessun contenuto finché i font pixel non sono pronti: evita FOUT
    // (flash di font di sistema) sul look pixel-perfect.
    return <View style={styles.blank} onLayout={onLayoutRootView} />;
  }

  return (
    <GestureHandlerRootView style={styles.flex} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppStateProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </AppStateProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  blank: {
    flex: 1,
    backgroundColor: colors.desktop,
  },
});
