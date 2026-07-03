// .shot (+ __tag) — placeholder scatto prodotto dithered (diagonal stripes).
// Nessuna immagine reale: si simula il dithering con strisce diagonali sovrapposte.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borders, fonts } from '../theme/theme';

interface ShotProps {
  height: number;
  color: string;
  label?: string;
  children?: React.ReactNode;
}

export default function Shot({ height, color, label, children }: ShotProps) {
  return (
    <View style={[styles.shot, { height, backgroundColor: color }]}>
      {/* Dithering approssimato: righe alternate semi-trasparenti bianche/ink */}
      <View style={styles.ditherOverlay}>
        {Array.from({ length: Math.ceil(height / 6) }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.ditherLine,
              { top: i * 6, backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.35)' : 'rgba(42,36,56,0.08)' },
            ]}
          />
        ))}
      </View>
      {label ? (
        <View style={styles.tag}>
          <Text style={styles.tagText}>{label}</Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shot: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    borderBottomWidth: borders.width,
    borderBottomColor: colors.ink,
    padding: 6,
    overflow: 'hidden',
  },
  ditherOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  ditherLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    transform: [{ rotate: '-45deg' }, { scale: 1.6 }],
  },
  tag: {
    backgroundColor: 'rgba(251,220,232,0.9)',
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 2,
    paddingVertical: 1,
    paddingHorizontal: 4,
  },
  tagText: {
    fontFamily: fonts.chrome,
    fontSize: 9,
    color: colors.ink,
  },
});
