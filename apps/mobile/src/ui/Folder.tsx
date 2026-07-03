// .folder — cartella Armadio (griglia 3 col), icona 📁 + label + count.
import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { colors, borders, fonts, shadowOffsets } from '../theme/theme';

interface FolderProps {
  label: string;
  count: number;
  onPress?: () => void;
}

export default function Folder({ label, count, onPress }: FolderProps) {
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <View pointerEvents="none" style={styles.shadow} />
      <View style={styles.card}>
        <Text style={styles.icon}>📁</Text>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.count}>{count}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    top: shadowOffsets.button.y,
    left: shadowOffsets.button.x,
    right: -shadowOffsets.button.x,
    bottom: -shadowOffsets.button.y,
    backgroundColor: colors.ink,
    borderRadius: borders.radius.folder,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 12,
    backgroundColor: colors.win,
    borderWidth: borders.width,
    borderColor: colors.ink,
    borderRadius: borders.radius.folder,
  },
  icon: {
    fontSize: 22,
  },
  label: {
    fontFamily: fonts.chrome,
    fontSize: 9,
    color: colors.ink,
    letterSpacing: 0.4,
  },
  count: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
  },
});
