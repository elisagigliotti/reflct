// .size-pill — badge taglia (Feed, overlay su card) e selettore taglia (Prova/Import).
import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, fonts, borders, shadowOffsets } from '../theme/theme';

interface SizePillBadgeProps {
  label: string;
  style?: object;
}

// Variante badge non interattiva (overlay sulla card Feed)
export function SizePillBadge({ label, style }: SizePillBadgeProps) {
  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

interface SizePillSelectableProps {
  label: string;
  active?: boolean;
  recommended?: boolean;
  onPress?: () => void;
}

// Variante selezionabile (selettore taglia in Prova/Import)
export function SizePillSelectable({ label, active, recommended, onPress }: SizePillSelectableProps) {
  return (
    <Pressable onPress={onPress} style={styles.selWrap}>
      <View pointerEvents="none" style={styles.selShadow} />
      <View style={[styles.selPill, active && styles.selPillActive]}>
        <Text style={[styles.selText, active && styles.selTextActive]}>{label}</Text>
      </View>
      {recommended && !active && (
        <View style={styles.recDot} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.cyan,
    borderWidth: borders.width,
    borderColor: colors.ink,
    borderRadius: borders.radius.button,
    paddingVertical: 2,
    paddingHorizontal: 6,
    shadowColor: undefined,
  },
  badgeText: {
    fontFamily: fonts.chromeBold,
    fontSize: 9,
    color: colors.ink,
  },
  selWrap: {
    position: 'relative',
  },
  selShadow: {
    position: 'absolute',
    top: shadowOffsets.button.y,
    left: shadowOffsets.button.x,
    right: -shadowOffsets.button.x,
    bottom: -shadowOffsets.button.y,
    backgroundColor: colors.ink,
    borderRadius: borders.radius.button,
  },
  selPill: {
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.win,
    borderWidth: borders.width,
    borderColor: colors.ink,
    borderRadius: borders.radius.button,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  selPillActive: {
    backgroundColor: colors.pink,
  },
  selText: {
    fontFamily: fonts.chrome,
    fontSize: 11,
    color: colors.ink,
  },
  selTextActive: {
    color: colors.white,
  },
  recDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.pink,
    borderWidth: 1,
    borderColor: colors.ink,
  },
});
