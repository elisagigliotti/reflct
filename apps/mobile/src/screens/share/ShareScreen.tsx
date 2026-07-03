// Condivisione (share.exe) — NUOVA, spec reskin (packages/design-tokens/README.md #7).
import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, borders, spacing } from '../../theme/theme';
import { FEED, SHARE_LINK_OPTIONS } from '../../data/mockData';
import DesktopBackground from '../../ui/DesktopBackground';
import Menubar from '../../ui/Menubar';
import UiWindow from '../../ui/UiWindow';
import WinTitle from '../../ui/WinTitle';
import Btn95 from '../../ui/Btn95';
import Shot from '../../ui/Shot';
import Row from '../../ui/Row';
import { TryOnStackParamList, WardrobeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<TryOnStackParamList | WardrobeStackParamList, 'Share'>;

const SOCIAL_GLYPHS: { key: string; glyph: string; label: string }[] = [
  { key: 'whatsapp', glyph: '✦', label: 'WhatsApp' },
  { key: 'instagram', glyph: '★', label: 'Instagram' },
  { key: 'tiktok', glyph: '♥', label: 'TikTok' },
  { key: 'x', glyph: '◈', label: 'X' },
];

export default function ShareScreen({ route }: Props) {
  const insets = useSafeAreaInsets();
  const [selectedLink, setSelectedLink] = useState('permanent');

  const itemId = route.params?.itemId;
  const item = useMemo(() => FEED.find((f) => f.id === itemId) ?? FEED[0], [itemId]);

  return (
    <DesktopBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: 20 }]}
      >
        <Menubar menuItems={['Share', 'Link', 'View']} />

        <UiWindow>
          <WinTitle label="share.exe — condividi look" icon="⇪" />
          <View style={styles.pad}>
            <View style={[styles.previewWrap, { transform: [{ rotate: '-0.6deg' }] }]}>
              <UiWindow>
                <WinTitle label={item.shotLabel} compact />
                <Shot height={200} color={item.shotColor} label={item.shotLabel} />
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName}>{item.name}</Text>
                  <Text style={styles.previewBrand}>{item.brand}</Text>
                </View>
              </UiWindow>
            </View>

            <Text style={styles.sectionLabel}>Opzioni link</Text>
            <View style={styles.linksList}>
              {SHARE_LINK_OPTIONS.map((opt) => (
                <Row
                  key={opt.id}
                  keyLabel={opt.label}
                  highlighted={selectedLink === opt.id}
                  onPress={() => setSelectedLink(opt.id)}
                />
              ))}
            </View>

            <Text style={styles.sectionLabel}>URL generato</Text>
            <View style={styles.urlBox}>
              <Text style={styles.urlText} numberOfLines={1}>
                reflct.app/l/{item.id}-{selectedLink}
              </Text>
              <Btn95 label="COPIA" variant="cyan" />
            </View>

            <Text style={styles.sectionLabel}>Condividi su</Text>
            <View style={styles.socialGrid}>
              {SOCIAL_GLYPHS.map((s) => (
                <View key={s.key} style={styles.socialBtn}>
                  <Text style={styles.socialGlyph}>{s.glyph}</Text>
                </View>
              ))}
            </View>

            <Btn95 label="ESPORTA 9:16" variant="cta" block style={styles.exportBtn} />
          </View>
        </UiWindow>
      </ScrollView>
    </DesktopBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 12 },
  pad: { padding: spacing.windowPadding },
  previewWrap: {
    marginBottom: 16,
  },
  previewInfo: {
    padding: 10,
    backgroundColor: colors.win,
  },
  previewName: {
    fontFamily: fonts.title,
    fontSize: 15,
    color: colors.ink,
  },
  previewBrand: {
    fontFamily: fonts.chrome,
    fontSize: 8,
    color: colors.muted,
    marginTop: 2,
  },
  sectionLabel: {
    fontFamily: fonts.chrome,
    fontSize: 10,
    color: colors.ink2,
    marginTop: 14,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  linksList: {},
  urlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.ink,
    borderRadius: 4,
    padding: 10,
  },
  urlText: {
    flex: 1,
    fontFamily: fonts.chrome,
    fontSize: 11,
    color: colors.ink,
  },
  socialGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderWidth: borders.width,
    borderColor: colors.ink,
    borderRadius: borders.radius.button,
    backgroundColor: colors.win,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialGlyph: {
    fontSize: 18,
    color: colors.ink,
  },
  exportBtn: {
    marginTop: 18,
  },
});
