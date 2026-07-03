// .row (+ __k, __v) — riga bigliettino (usata in settings, shop popolari, share options).
import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { colors, fonts, borders } from '../theme/theme';

interface RowProps {
  keyLabel: string;
  valueLabel?: string;
  onPress?: () => void;
  highlighted?: boolean;
  showChevron?: boolean;
  icon?: string;
}

export default function Row({ keyLabel, valueLabel, onPress, highlighted, showChevron, icon }: RowProps) {
  return (
    <Pressable onPress={onPress} style={[styles.row, highlighted && styles.rowHighlighted]}>
      <View style={styles.left}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text style={styles.key} numberOfLines={1}>
          {keyLabel}
        </Text>
      </View>
      <View style={styles.right}>
        {valueLabel ? (
          <Text style={styles.value} numberOfLines={1}>
            {valueLabel}
          </Text>
        ) : null}
        {showChevron ? <Text style={styles.chevron}>›</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(42,36,56,0.15)',
  },
  rowHighlighted: {
    backgroundColor: colors.yellow,
    borderRadius: borders.radius.button,
    borderBottomWidth: 0,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  icon: {
    fontSize: 16,
  },
  key: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    fontFamily: fonts.chrome,
    fontSize: 11,
    color: colors.cyan,
  },
  chevron: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.muted,
  },
});
