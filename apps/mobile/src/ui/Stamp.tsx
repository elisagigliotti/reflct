// .stamp — timbro/badge pixel, bordo/testo = currentColor.
import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { fonts, borders } from '../theme/theme';

interface StampProps {
  label: string;
  color: string;
  style?: TextStyle;
}

export default function Stamp({ label, color, style }: StampProps) {
  return (
    <Text style={[styles.stamp, { color, borderColor: color }, style]} numberOfLines={1}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  stamp: {
    fontFamily: fonts.chrome,
    fontSize: 9,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    borderWidth: borders.width,
    borderRadius: borders.radius.button,
    paddingVertical: 2,
    paddingHorizontal: 5,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
});
