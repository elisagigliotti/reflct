// .win — finestra base (chrome + body). Simula box-shadow offset-solido con
// una View assoluta dietro (niente shadowOpacity/elevation sfumata).
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borders, shadowOffsets } from '../theme/theme';

interface UiWindowProps {
  children: React.ReactNode;
  variant?: 'default' | 'mint';
  style?: ViewStyle;
  noShadow?: boolean;
}

export default function UiWindow({ children, variant = 'default', style, noShadow }: UiWindowProps) {
  return (
    <View style={[styles.wrap, style]}>
      {!noShadow && <View pointerEvents="none" style={styles.shadow} />}
      <View
        style={[
          styles.win,
          variant === 'mint' ? styles.winMint : styles.winDefault,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    top: shadowOffsets.window.y,
    left: shadowOffsets.window.x,
    right: -shadowOffsets.window.x,
    bottom: -shadowOffsets.window.y,
    backgroundColor: colors.ink,
    borderRadius: borders.radius.window,
  },
  win: {
    borderWidth: borders.width,
    borderColor: colors.ink,
    borderRadius: borders.radius.window,
    overflow: 'hidden',
  },
  winDefault: {
    backgroundColor: colors.win,
  },
  winMint: {
    backgroundColor: colors.winAlt,
  },
});
