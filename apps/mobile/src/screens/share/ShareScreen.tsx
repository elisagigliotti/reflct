// Condivisione (share.exe) — NUOVA, spec reskin (packages/design-tokens/README.md #7).
// Dati REALI: POST /api/v1/tryon/start → POST /api/v1/share.
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, borders, spacing } from '../../theme/theme';
import DesktopBackground from '../../ui/DesktopBackground';
import Menubar from '../../ui/Menubar';
import UiWindow from '../../ui/UiWindow';
import WinTitle from '../../ui/WinTitle';
import Btn95 from '../../ui/Btn95';
import Shot from '../../ui/Shot';
import Row from '../../ui/Row';
import { TryOnStackParamList, WardrobeStackParamList } from '../../navigation/types';
import { useAppState } from '../../state/AppStateContext';
import { startTryOn } from '../../api/tryon';
import { createShareLink, TipoSharedLink } from '../../api/share';

type Props = NativeStackScreenProps<TryOnStackParamList | WardrobeStackParamList, 'Share'>;

const LINK_OPTIONS: { id: string; label: string; tipo: TipoSharedLink }[] = [
  { id: 'permanent', label: 'Link permanente', tipo: 'PERMANENT' },
  { id: '24h', label: 'Link 24h', tipo: 'H24' },
  { id: '7d', label: 'Link 7gg', tipo: 'D7' },
  { id: '30d', label: 'Link 30gg', tipo: 'D30' },
  { id: 'pin', label: 'Link con PIN', tipo: 'PIN_PROTECTED' },
];

const SOCIAL_GLYPHS = [
  { key: 'whatsapp', glyph: '✦', label: 'WhatsApp' },
  { key: 'instagram', glyph: '★', label: 'Instagram' },
  { key: 'tiktok', glyph: '♥', label: 'TikTok' },
  { key: 'x', glyph: '◈', label: 'X' },
];

export default function ShareScreen({ route }: Props) {
  const insets = useSafeAreaInsets();
  const { getItem } = useAppState();
  const [selectedId, setSelectedId] = useState('permanent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [pin, setPin] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const itemId = route.params?.itemId;
  const item = itemId ? getItem(itemId) ?? null : null;

  // Al mount: crea sessione try-on per il capo corrente
  useEffect(() => {
    if (!item) {
      setError('Capo non trovato. Torna al feed e riprova da lì.');
      return;
    }
    setLoading(true);
    setError(null);
    startTryOn({ garmentId: String(item.id), fotoUrl: 'https://reflct.app/placeholder/avatar.jpg' })
      .then((session) => {
        setSessionId(session.id);
        return generateLink(session.id, 'PERMANENT');
      })
      .catch(() => {
        setError('Impossibile avviare la sessione per questo capo.');
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateLink = (sid: string, tipo: TipoSharedLink) =>
    createShareLink({ sessionId: sid, tipo })
      .then((link) => {
        setGeneratedUrl(`reflct.app/l/${link.token}`);
        setPin(link.pinInChiaro ?? null);
        setCopied(false);
      })
      .finally(() => setLoading(false));

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (!sessionId) return;
    const opt = LINK_OPTIONS.find((o) => o.id === id);
    if (!opt) return;
    setLoading(true);
    generateLink(sessionId, opt.tipo);
  };

  const handleCopy = () => {
    if (!generatedUrl) return;
    setCopied(true);
  };

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
            {item && (
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
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Text style={styles.sectionLabel}>Opzioni link</Text>
            <View style={styles.linksList}>
              {LINK_OPTIONS.map((opt) => (
                <Row
                  key={opt.id}
                  keyLabel={opt.label}
                  highlighted={selectedId === opt.id}
                  onPress={() => handleSelect(opt.id)}
                />
              ))}
            </View>

            <Text style={styles.sectionLabel}>URL generato</Text>
            {loading ? (
              <ActivityIndicator color={colors.pink} style={{ marginVertical: 12 }} />
            ) : (
              <View style={styles.urlBox}>
                <Text style={styles.urlText} numberOfLines={1}>
                  {generatedUrl ?? '—'}
                </Text>
                <Btn95 label={copied ? 'COPIATO ✓' : 'COPIA'} variant="cyan" onPress={handleCopy} />
              </View>
            )}

            {pin && (
              <View style={styles.pinBox}>
                <Text style={styles.pinLabel}>PIN: </Text>
                <Text style={styles.pinValue}>{pin}</Text>
              </View>
            )}

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
  previewWrap: { marginBottom: 16 },
  previewInfo: { padding: 10, backgroundColor: colors.win },
  previewName: { fontFamily: fonts.title, fontSize: 15, color: colors.ink },
  previewBrand: { fontFamily: fonts.chrome, fontSize: 8, color: colors.muted, marginTop: 2 },
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
  urlText: { flex: 1, fontFamily: fonts.chrome, fontSize: 11, color: colors.ink },
  pinBox: {
    flexDirection: 'row',
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.yellow,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 4,
  },
  pinLabel: { fontFamily: fonts.chrome, fontSize: 12, color: colors.ink },
  pinValue: { fontFamily: fonts.chromeBold, fontSize: 12, color: colors.ink },
  errorText: { fontFamily: fonts.body, fontSize: 13, color: colors.pink, marginBottom: 10 },
  socialGrid: { flexDirection: 'row', gap: 10 },
  socialBtn: {
    width: 44, height: 44,
    borderWidth: borders.width, borderColor: colors.ink,
    borderRadius: borders.radius.button, backgroundColor: colors.win,
    alignItems: 'center', justifyContent: 'center',
  },
  socialGlyph: { fontSize: 18, color: colors.ink },
  exportBtn: { marginTop: 18 },
});
