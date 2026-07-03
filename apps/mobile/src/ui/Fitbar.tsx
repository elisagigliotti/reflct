// .fitbar — barra a 10 segmenti (fit score) o a 2 segmenti proporzionali (Battle voti).
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, borders } from '../theme/theme';

interface FitbarProps {
  segments?: number;
  filledRatio: number; // 0..1
  filledColor?: string;
}

export default function Fitbar({ segments = 10, filledRatio, filledColor = colors.mint }: FitbarProps) {
  const filledCount = Math.round(segments * filledRatio);
  return (
    <View style={styles.row}>
      {Array.from({ length: segments }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            { backgroundColor: i < filledCount ? filledColor : colors.win },
          ]}
        />
      ))}
    </View>
  );
}

// Barra a 2 segmenti proporzionali (Battle: voti A/B che sommano 100%)
export function DualFitbar({ ratioA, colorA = colors.pink, colorB = colors.cyan }: { ratioA: number; colorA?: string; colorB?: string }) {
  const pctA = Math.max(0, Math.min(1, ratioA)) * 100;
  return (
    <View style={styles.dualWrap}>
      <View style={[styles.dualSegment, { flexGrow: pctA, backgroundColor: colorA }]} />
      <View style={[styles.dualSegment, { flexGrow: 100 - pctA, backgroundColor: colorB }]} />
    </View>
  );
}

const styles = StyleSheet.create({
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
