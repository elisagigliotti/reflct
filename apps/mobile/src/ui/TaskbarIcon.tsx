// .taskbar-item — icona nav bottom tab, skinnata come da handoff
// (bordo trasparente -> bordo bianco+ombra quando attiva). Usato dentro
// il tabBarIcon custom di MainTabs.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borders, fonts, shadowOffsets } from '../theme/theme';

interface TaskbarIconProps {
  icon: string;
  label: string;
  active?: boolean;
}

export default function TaskbarIcon({ icon, label, active }: TaskbarIconProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.icoWrap}>
        {active && <View pointerEvents="none" style={styles.icoShadow} />}
        <View style={[styles.ico, active && styles.icoActive]}>
          <Text style={styles.icoText}>{icon}</Text>
        </View>
      </View>
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: 52,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  icoWrap: {
    position: 'relative',
  },
  icoShadow: {
    position: 'absolute',
    top: shadowOffsets.button.y,
    left: shadowOffsets.button.x,
    right: -shadowOffsets.button.x,
    bottom: -shadowOffsets.button.y,
    backgroundColor: colors.ink,
    borderRadius: borders.radius.window,
  },
  ico: {
    width: 30,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borders.width,
    borderColor: 'transparent',
    borderRadius: borders.radius.window,
  },
  icoActive: {
    backgroundColor: colors.white,
    borderColor: colors.ink,
  },
  icoText: {
    fontSize: 16,
    lineHeight: 18,
  },
  label: {
    fontFamily: fonts.chrome,
    fontSize: 8,
    color: colors.ink2,
  },
  labelActive: {
    color: colors.ink,
  },
});
