// .swatch — pallino colore selezionabile (selettore colore in Prova).
import React, { useMemo } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { borders } from '../theme/theme';
import { useTheme } from '../theme/ThemeContext';
import { ReflctPalette } from '../../../../packages/design-tokens/rn/theme';

interface SwatchProps {
  color: string;
  active?: boolean;
  onPress?: () => void;
}

export default function Swatch({ color, active, onPress }: SwatchProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <View style={[styles.swatch, { backgroundColor: color }, active && styles.active]} />
    </Pressable>
  );
}

function createStyles(colors: ReflctPalette) {
  return StyleSheet.create({
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
}
