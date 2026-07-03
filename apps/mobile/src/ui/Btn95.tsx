// .btn-95 (+ --cta/--cyan/--yellow/--block) — bottone beveled retro.
// Hover del web -> onPressIn/onPressOut con stile "premuto" (translate + ombra 0).
import React, { useState } from 'react';
import { Pressable, Text, View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, fonts, borders, shadowOffsets } from '../theme/theme';

type Btn95Variant = 'default' | 'cta' | 'cyan' | 'yellow';

interface Btn95Props {
  label: string;
  onPress?: () => void;
  variant?: Btn95Variant;
  block?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const VARIANT_BG: Record<Btn95Variant, string> = {
  default: colors.win,
  cta: colors.pink,
  cyan: colors.cyan,
  yellow: colors.yellow,
};

const VARIANT_TEXT_COLOR: Record<Btn95Variant, string> = {
  default: colors.ink,
  cta: colors.white,
  cyan: colors.ink,
  yellow: colors.ink,
};

export default function Btn95({
  label,
  onPress,
  variant = 'default',
  block,
  disabled,
  icon,
  style,
  textStyle,
}: Btn95Props) {
  const [pressed, setPressed] = useState(false);

  const offset = pressed ? { x: shadowOffsets.button.x + 2, y: shadowOffsets.button.y + 2 } : shadowOffsets.button;
  const translate = pressed ? { x: 2, y: 2 } : { x: 0, y: 0 };
  const shadowVisible = !pressed;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.wrap, block && styles.block, style]}
    >
      {shadowVisible && (
        <View
          pointerEvents="none"
          style={[
            styles.shadow,
            { top: shadowOffsets.button.y, left: shadowOffsets.button.x, right: -shadowOffsets.button.x, bottom: -shadowOffsets.button.y },
          ]}
        />
      )}
      <View
        style={[
          styles.btn,
          { backgroundColor: VARIANT_BG[variant] },
          disabled && styles.disabled,
          { transform: [{ translateX: translate.x }, { translateY: translate.y }] },
        ]}
      >
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text style={[styles.label, { color: VARIANT_TEXT_COLOR[variant] }, textStyle]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  block: {
    alignSelf: 'stretch',
  },
  shadow: {
    position: 'absolute',
    backgroundColor: colors.ink,
    borderRadius: borders.radius.button,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 34,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderWidth: borders.width,
    borderColor: colors.ink,
    borderRadius: borders.radius.button,
  },
  disabled: {
    opacity: 0.6,
  },
  icon: {
    fontSize: 12,
  },
  label: {
    fontFamily: fonts.chrome,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
