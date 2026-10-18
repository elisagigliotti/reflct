// Sfondo desktop menta con griglia + gradiente lavanda->menta in alto,
// come da prototipo HTML (background-size 20x20 grid + linear-gradient).
// RN non supporta CSS repeating-gradient nativo: si approssima con una
// griglia di linee sottili disegnate via View assolute (leggere, poche righe).
import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ReflctPalette } from '../../../../packages/design-tokens/rn/theme';

const GRID_SIZE = 20;

export default function DesktopBackground({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { height, width } = Dimensions.get('window');
  const cols = Math.ceil(width / GRID_SIZE);
  const rows = Math.ceil(height / GRID_SIZE);

  return (
    <View style={styles.root}>
      {/* gradiente semplificato: banda lavanda in alto che sfuma nel menta */}
      <View style={styles.gradientTop} />
      <View pointerEvents="none" style={styles.gridLayer}>
        {Array.from({ length: cols }).map((_, i) => (
          <View key={`v${i}`} style={[styles.gridLineV, { left: i * GRID_SIZE }]} />
        ))}
        {Array.from({ length: rows }).map((_, i) => (
          <View key={`h${i}`} style={[styles.gridLineH, { top: i * GRID_SIZE }]} />
        ))}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

function inkGridLine(ink: string): string {
  const hex = ink.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r},${g},${b},0.08)`;
}

function createStyles(colors: ReflctPalette) {
  const gridLineColor = inkGridLine(colors.ink);
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.desktop,
    },
    gradientTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '18%',
      backgroundColor: colors.lav,
      opacity: 0.55,
    },
    gridLayer: {
      ...StyleSheet.absoluteFillObject,
    },
    gridLineV: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 1,
      backgroundColor: gridLineColor,
    },
    gridLineH: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: gridLineColor,
    },
    content: {
      flex: 1,
    },
  });
}
