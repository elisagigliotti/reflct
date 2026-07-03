// .win-title (+ --teal) — barra del titolo con pulsantini finestra (_ □ ×).
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts, borders } from '../theme/theme';

interface WinTitleProps {
  label: string;
  variant?: 'default' | 'teal';
  icon?: string;
  compact?: boolean;
  style?: ViewStyle;
}

export default function WinTitle({ label, variant = 'default', icon, compact, style }: WinTitleProps) {
  return (
    <View
      style={[
        styles.bar,
        variant === 'teal' ? styles.barTeal : styles.barDefault,
        compact && styles.barCompact,
        style,
      ]}
    >
      {icon ? <Text style={[styles.icon, compact && styles.iconCompact]}>{icon}</Text> : null}
      <Text style={[styles.label, compact && styles.labelCompact]} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.btns}>
        {compact ? (
          <View style={[styles.sq, styles.sqCompact]}>
            <Text style={[styles.sqText, styles.sqTextCompact]}>×</Text>
          </View>
        ) : (
          <>
            <View style={styles.sq}>
              <Text style={styles.sqText}>_</Text>
            </View>
            <View style={styles.sq}>
              <Text style={styles.sqText}>□</Text>
            </View>
            <View style={styles.sq}>
              <Text style={styles.sqText}>×</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: borders.width,
    borderBottomColor: colors.ink,
    borderTopLeftRadius: borders.radius.titleBar,
    borderTopRightRadius: borders.radius.titleBar,
    paddingVertical: 3,
    paddingHorizontal: 5,
  },
  barDefault: {
    backgroundColor: colors.chrome,
  },
  barTeal: {
    backgroundColor: colors.chrome2,
  },
  barCompact: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  icon: {
    fontSize: 8,
    color: colors.ink,
  },
  iconCompact: {
    fontSize: 7,
  },
  label: {
    flex: 1,
    fontFamily: fonts.pixel,
    fontSize: 8,
    color: colors.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelCompact: {
    fontSize: 7,
  },
  btns: {
    flexDirection: 'row',
    gap: 3,
    flexShrink: 0,
  },
  sq: {
    width: 13,
    height: 12,
    backgroundColor: colors.win,
    borderWidth: borders.width,
    borderColor: colors.ink,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sqCompact: {
    width: 11,
    height: 10,
  },
  sqText: {
    fontSize: 8,
    lineHeight: 8,
    color: colors.ink,
  },
  sqTextCompact: {
    fontSize: 7,
    lineHeight: 7,
  },
});
