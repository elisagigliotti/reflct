// .menubar — barra menu OS persistente in cima (logo + voci contestuali + data).
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fonts, borders } from '../theme/theme';
import { useTheme } from '../theme/ThemeContext';
import { ReflctPalette } from '../../../../packages/design-tokens/rn/theme';
import UiWindow from './UiWindow';

interface MenubarProps {
  menuItems?: string[];
}

export default function Menubar({ menuItems = ['File', 'Fit', 'View'] }: MenubarProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <UiWindow style={styles.wrap}>
      <View style={styles.bar}>
        <Text style={styles.logo}>Reflct</Text>
        {menuItems.map((label) => (
          <Text key={label} style={styles.menuItem}>
            {label}
          </Text>
        ))}
        <Text style={styles.date}>▚ 1999/05/23</Text>
      </View>
    </UiWindow>
  );
}

function createStyles(colors: ReflctPalette) {
  return StyleSheet.create({
    wrap: {
      marginBottom: 12,
    },
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      borderBottomWidth: borders.width,
      borderBottomColor: colors.ink,
      paddingVertical: 4,
      paddingHorizontal: 8,
      backgroundColor: colors.win,
    },
    logo: {
      fontFamily: fonts.pixel,
      fontSize: 9,
      color: colors.pink,
    },
    menuItem: {
      fontFamily: fonts.chrome,
      fontSize: 10,
      color: colors.ink,
    },
    date: {
      marginLeft: 'auto',
      fontFamily: fonts.body,
      fontSize: 15,
      color: colors.ink2,
    },
  });
}
