/**
 * Reflct OS — Design tokens (React Native)
 * Stile: retro-OS Y2K / vaporwave. Fonte di verita': packages/design-tokens/tokens.json
 * Import: import { colors, fonts, radii, shadows, spacing } from '@reflct/design-tokens/rn/theme';
 */

export const colors = {
  desktop: '#9FE0CC',
  desktop2: '#7FD4BE',
  win: '#FBDCE8',
  winAlt: '#DCF3EC',
  chrome: '#F49AC1',
  chrome2: '#6FCBB6',
  ink: '#2A2438',
  ink2: '#5A4E6E',
  muted: '#8A7FA0',
  pink: '#FF5FA2',
  cyan: '#4FD3E6',
  mint: '#2FAF8E',
  yellow: '#F5D14E',
  lav: '#C6A5F2',
  warn: '#F5A03D',
  white: '#FFFFFF',
} as const;

// I file .ttf vanno bundlati in assets/fonts e caricati con expo-font (useFonts).
// NON caricare da Google Fonts a runtime su native (vedi README handoff).
export const fonts = {
  pixel: 'PressStart2P_400Regular', // logo, username, numeri grandi
  chrome: 'Silkscreen_400Regular', // chrome, tab, badge, taskbar
  chromeBold: 'Silkscreen_700Bold',
  body: 'VT323_400Regular', // corpo, prezzi, liste
  title: 'PixelifySans_600SemiBold', // titoli capi/dialog
  titleBold: 'PixelifySans_700Bold',
} as const;

export const borders = {
  width: 2,
  color: colors.ink,
  radius: {
    window: 4,
    folder: 5,
    button: 3,
    titleBar: 2,
  },
} as const;

// React Native non ha box-shadow offset-solido nativo: si simula con un
// elemento "ombra" posizionato assoluto dietro al contenuto (vedi UiWindow / Btn95
// in apps/mobile), oppure elevation piatta + bordo. MAI blur/opacity graduale.
export const shadowOffsets = {
  window: { x: 3, y: 3 },
  windowHover: { x: 5, y: 5 },
  button: { x: 2, y: 2 },
  buttonHover: { x: 4, y: 4 },
} as const;

export const motion = {
  cardHover: { x: -1, y: -2 },
  buttonHover: { x: -1, y: -1 },
  buttonActive: { x: 2, y: 2 },
  durationMs: 140,
} as const;

export const spacing = {
  blockGap: 12,
  windowPadding: 13,
  masonryColumnGap: 12,
  folderGridGap: 8,
} as const;

export const collage = {
  rotationMinDeg: -1.4,
  rotationMaxDeg: 1.4,
} as const;

export const nav = [
  { key: 'Feed', icon: '🖥', label: 'FEED' },
  { key: 'Prova', icon: '🪞', label: 'PROVA' },
  { key: 'Armadio', icon: '🗄', label: 'ARMADIO' },
  { key: 'Io', icon: '💾', label: 'IO' },
] as const;

export type ReflctColor = keyof typeof colors;
