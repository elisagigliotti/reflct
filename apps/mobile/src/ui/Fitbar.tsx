// .fitbar — barra a 10 segmenti (fit score) o a 2 segmenti proporzionali (Battle voti).
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { borders } from '../theme/theme';
import { useTheme } from '../theme/ThemeContext';
import { ReflctPalette } from '../../../../packages/design-tokens/rn/theme';

interface FitbarProps {
  segments?: number;
  filledRatio: number; // 0..1
  filledColor?: string;
}

export default function Fitbar({ segments = 10, filledRatio, filledColor }: FitbarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const resolvedFilledColor = filledColor ?? colors.mint;
  const filledCount = Math.round(segments * filledRatio);
  return (
    <View style={styles.row}>
      {Array.from({ length: segments }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            { backgroundColor: i < filledCount ? resolvedFilledColor : colors.win },
          ]}
        />
      ))}
    </View>
  );
}

// Barra a 2 segmenti proporzionali (Battle: voti A/B che sommano 100%)
export function DualFitbar({ ratioA, colorA, colorB }: { ratioA: number; colorA?: string; colorB?: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const pctA = Math.max(0, Math.min(1, ratioA)) * 100;
  return (
    <View style={styles.dualWrap}>
      <View style={[styles.dualSegment, { flexGrow: pctA, backgroundColor: colorA ?? colors.pink }]} />
      <View style={[styles.dualSegment, { flexGrow: 100 - pctA, backgroundColor: colorB ?? colors.cyan }]} />
    </View>
  );
}

function createStyles(colors: ReflctPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: 3,
    },
    segment: {
      flex: 1,
      height: 14,
      borderWidth: borders.width,
      borderColor: colors.ink,
      borderRadius: 2,
    },
    dualWrap: {
      flexDirection: 'row',
      height: 16,
      borderWidth: borders.width,
      borderColor: colors.ink,
      borderRadius: 3,
      overflow: 'hidden',
    },
    dualSegment: {
      height: '100%',
    },
  });
}
