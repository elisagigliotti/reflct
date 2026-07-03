// .swatch — pallino colore selezionabile (selettore colore in Prova).
import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { colors, borders } from '../theme/theme';

interface SwatchProps {
  color: string;
  active?: boolean;
  onPress?: () => void;
}

export default function Swatch({ color, active, onPress }: SwatchProps) {
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <View style={[styles.swatch, { backgroundColor: color }, active && styles.active]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 2,
  },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: borders.radius.folder,
    borderWidth: borders.width,
    borderColor: colors.ink,
  },
  active: {
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: colors.ink,
  },
});
