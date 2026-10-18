// .btn-95 (+ --cta/--cyan/--yellow/--block) — bottone beveled retro.
// Hover del web -> onPressIn/onPressOut con stile "premuto" (translate + ombra 0).
import React, { useMemo, useState } from 'react';
import { Pressable, Text, View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { fonts, borders, shadowOffsets } from '../theme/theme';
import { useTheme } from '../theme/ThemeContext';
import { ReflctPalette } from '../../../../packages/design-tokens/rn/theme';

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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [pressed, setPressed] = useState(false);

  const variantBg: Record<Btn95Variant, string> = {
    default: colors.win,
    cta: colors.pink,
    cyan: colors.cyan,
    yellow: colors.yellow,
  };
  const variantTextColor: Record<Btn95Variant, string> = {
    default: colors.ink,
    cta: colors.white,
    cyan: colors.ink,
    yellow: colors.ink,
  };

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
          { backgroundColor: variantBg[variant] },
          disabled && styles.disabled,
          { transform: [{ translateX: translate.x }, { translateY: translate.y }] },
        ]}
      >
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text style={[styles.label, { color: variantTextColor[variant] }, textStyle]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function createStyles(colors: ReflctPalette) {
  return StyleSheet.create({
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
}
