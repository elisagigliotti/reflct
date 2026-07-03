// Onboarding (onboarding.exe) — NUOVA, spec di reskin (packages/design-tokens/README.md #1).
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing } from '../theme/theme';
import DesktopBackground from '../ui/DesktopBackground';
import UiWindow from '../ui/UiWindow';
import WinTitle from '../ui/WinTitle';
import Stamp from '../ui/Stamp';
import Btn95 from '../ui/Btn95';
import Shot from '../ui/Shot';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const MINI_WINDOWS_ROT = [-1.2, 0.8, -0.4, 1.1, -1.4, 0.5, 1.3, -0.7, 0.2];
const MINI_COLORS = [
  colors.cyan,
  colors.pink,
  colors.lav,
  colors.yellow,
  colors.mint,
  '#FF9EC7',
  colors.cyan,
  colors.lav,
  colors.pink,
];

export default function OnboardingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <DesktopBackground>
      <View style={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        <UiWindow style={styles.window}>
          <WinTitle label="C:\reflct\onboarding.exe" />
          <View style={styles.body}>
            <View style={styles.logoRow}>
              <Text style={styles.glyph}>✦</Text>
              <Text style={styles.logo}>Reflct</Text>
              <Text style={styles.glyph}>✦</Text>
            </View>

            {/* Griglia 3x3 mini-finestre placeholder, con fade verso il basso */}
            <View style={styles.gridWrap}>
              <View style={styles.grid}>
                {MINI_WINDOWS_ROT.map((rot, i) => (
                  <View key={i} style={[styles.miniCell, { transform: [{ rotate: `${rot}deg` }] }]}>
                    <Shot height={54} color={MINI_COLORS[i]} />
                  </View>
                ))}
              </View>
              <View style={styles.gridFade} />
            </View>

            <Text style={styles.headline}>Prova vestiti prima di comprarli.</Text>

            <View style={styles.stampRow}>
              <Stamp label="AR" color={colors.cyan} />
              <Stamp label="IMPORT" color={colors.mint} />
              <Stamp label="SIZE" color={colors.lav} />
            </View>

            <Btn95
              label="INIZIA →"
              variant="cta"
              block
              style={styles.cta}
              onPress={() => navigation.navigate('Register')}
            />

            <View style={styles.ghostNote}>
              <Text style={styles.ghostNoteText}>nessuna carta richiesta</Text>
            </View>
          </View>
        </UiWindow>
      </View>
    </DesktopBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  window: {},
  body: {
    padding: spacing.windowPadding,
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  glyph: {
    fontSize: 16,
    color: colors.lav,
  },
  logo: {
    fontFamily: fonts.pixel,
    fontSize: 22,
    color: colors.pink,
  },
  gridWrap: {
    width: '100%',
    height: 190,
    position: 'relative',
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    padding: 4,
  },
  miniCell: {
    width: '30%',
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.win,
  },
  gridFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    backgroundColor: colors.desktop2,
    opacity: 0.85,
  },
  headline: {
    fontFamily: fonts.titleBold,
    fontSize: 18,
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 14,
  },
  stampRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  cta: {
    width: '100%',
  },
  ghostNote: {
    marginTop: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.muted,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  ghostNoteText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
  },
});
