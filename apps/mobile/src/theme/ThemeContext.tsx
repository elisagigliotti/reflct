// Provider del tema attivo (palette colori runtime). Persistito con
// expo-secure-store (stesso meccanismo del token, vedi src/api/client.ts).
// I componenti in src/ui/* leggono i colori da qui invece che dall'import
// statico di design-tokens, cosi' il cambio tema si riflette subito in UI.
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  palettes,
  themeMeta,
  DEFAULT_THEME,
  ThemeId,
  ReflctPalette,
} from '../../../../packages/design-tokens/rn/theme';

const THEME_KEY = 'reflct_theme';

interface ThemeContextValue {
  themeId: ThemeId;
  colors: ReflctPalette;
  setThemeId: (id: ThemeId) => void;
  options: typeof themeMeta;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    (async () => {
      const saved = await SecureStore.getItemAsync(THEME_KEY);
      if (saved && saved in palettes) {
        setThemeIdState(saved as ThemeId);
      }
    })();
  }, []);

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    SecureStore.setItemAsync(THEME_KEY, id).catch(() => {});
  };

  const value = useMemo<ThemeContextValue>(
    () => ({ themeId, colors: palettes[themeId], setThemeId, options: themeMeta }),
    [themeId],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme deve essere usato dentro ThemeProvider');
  }
  return ctx;
}
