// .tab — linguetta filtro (usata in filter-strip Feed e nei tab pill Battle/Social).
import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, fonts, borders, shadowOffsets } from '../theme/theme';

interface TabProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export default function Tab({ label, active, onPress }: TabProps) {
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <View pointerEvents="none" style={styles.shadow} />
      <View style={[styles.tab, active && styles.tabActive]}>
        <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    top: shadowOffsets.button.y,
    left: shadowOffsets.button.x,
    right: -shadowOffsets.button.x,
    bottom: -shadowOffsets.button.y,
    backgroundColor: colors.ink,
    borderRadius: borders.radius.button,
  },
  tab: {
    backgroundColor: colors.winAlt,
    borderWidth: borders.width,
    borderColor: colors.ink,
    borderRadius: borders.radius.button,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tabActive: {
    backgroundColor: colors.pink,
  },
  label: {
    fontFamily: fonts.chrome,
    fontSize: 11,
    color: colors.ink,
  },
  labelActive: {
    color: colors.white,
  },
});
