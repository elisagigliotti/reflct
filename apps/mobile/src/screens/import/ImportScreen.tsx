// Import Link (import.exe) — NUOVA, spec reskin (packages/design-tokens/README.md #4).
// Dati REALI: POST /api/v1/garments/import (delega a scraping-service).
import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, borders, spacing, shadowOffsets } from '../../theme/theme';
import { SHOP_LINKS, SIZES } from '../../data/mockData';
import DesktopBackground from '../../ui/DesktopBackground';
import Menubar from '../../ui/Menubar';
import UiWindow from '../../ui/UiWindow';
import WinTitle from '../../ui/WinTitle';
import Btn95 from '../../ui/Btn95';
import Stamp from '../../ui/Stamp';
import Row from '../../ui/Row';
import { SizePillSelectable } from '../../ui/SizePill';
import FeedCard from '../../ui/FeedCard';
import { useAppState } from '../../state/AppStateContext';
import { FeedStackParamList } from '../../navigation/types';
import { importGarment, GarmentItemResponse } from '../../api/garments';
import { toFeedItem } from '../../data/garmentVisuals';
import { FeedItem } from '../../data/models';

type Props = NativeStackScreenProps<FeedStackParamList, 'Import'>;

export default function ImportScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { liked, toggleLike } = useAppState();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imported, setImported] = useState<FeedItem | null>(null);
  const [addedToWardrobe, setAddedToWardrobe] = useState(false);
  const [size, setSize] = useState<(typeof SIZES)[number]>('M');

  const handleAnalyze = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setImported(null);
    setAddedToWardrobe(false);
    try {
      const garment: GarmentItemResponse = await importGarment(trimmed);
      setImported(toFeedItem(garment));
    } catch {
      setError('Impossibile importare questo link. Riprova con un altro URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWardrobe = () => {
    if (!imported || addedToWardrobe) return;
    toggleLike(imported.id);
    setAddedToWardrobe(true);
  };

  return (
    <DesktopBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: 20 }]}
      >
        <Menubar menuItems={['Import', 'Size', 'View']} />

        <UiWindow>
          <WinTitle label="import.exe — incolla link" icon="⎘" />
          <View style={styles.pad}>
            <View style={styles.urlBarWrap}>
              <View pointerEvents="none" style={styles.urlBarShadow} />
              <TextInput
                value={url}
                onChangeText={setUrl}
                placeholder="https://…"
                placeholderTextColor={colors.muted}
                style={styles.urlInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Btn95 label="ANALIZZA" variant="cyan" block style={styles.analyzeBtn} onPress={handleAnalyze} />

            {loading && (
              <View style={styles.loadingBox}>
                <Text style={styles.loadingText}>analisi in corso…</Text>
              </View>
            )}

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {imported && (
              <View style={styles.previewSection}>
                <FeedCard
                  item={{ ...imported, rot: -0.5 }}
                  liked={!!liked[String(imported.id)]}
                  onPress={() =>
                    navigation
                      .getParent()
                      ?.navigate('Prova', { screen: 'TryOnHome', params: { itemId: imported.id } })
                  }
                  onToggleLike={() => toggleLike(imported.id)}
                />

                <Text style={styles.sectionLabel}>Taglia</Text>
                <View style={styles.sizeRow}>
                  {SIZES.map((s) => (
                    <View key={s} style={styles.sizeItem}>
                      <SizePillSelectable label={s} active={s === size} onPress={() => setSize(s)} />
                      {s === 'M' && <Stamp label="CONSIGLIATA" color={colors.pink} style={styles.recommendedStamp} />}
                    </View>
                  ))}
                </View>

                <UiWindow variant="mint" style={styles.fitBox}>
                  <View style={styles.fitBoxPad}>
                    <Text style={styles.fitBoxText}>vestibilità: ottima</Text>
                  </View>
                </UiWindow>

                <Btn95
                  label={addedToWardrobe ? 'AGGIUNTO ✓' : 'AGGIUNGI AL GUARDAROBA'}
                  variant="cta"
                  block
                  style={styles.ctaBtn}
                  onPress={handleAddToWardrobe}
                />
              </View>
            )}

            <Text style={styles.shopsTitle}>Shop popolari</Text>
            <View style={styles.shopsList}>
              {SHOP_LINKS.map((shop) => (
                <Row
                  key={shop.id}
                  icon="🛍"
                  keyLabel={shop.name}
                  onPress={() =>
                    setUrl(`https://www.${shop.name.toLowerCase().replace('&', '')}.com/prodotto/123`)
                  }
                  showChevron
                />
              ))}
            </View>
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
  urlBarWrap: {
    position: 'relative',
    marginBottom: 10,
  },
  urlBarShadow: {
    position: 'absolute',
    top: shadowOffsets.button.y,
    left: shadowOffsets.button.x,
    right: -shadowOffsets.button.x,
    bottom: -shadowOffsets.button.y,
    backgroundColor: colors.ink,
    borderRadius: borders.radius.button,
  },
  urlInput: {
    borderWidth: borders.width,
    borderColor: colors.ink,
    borderRadius: borders.radius.button,
    backgroundColor: colors.win,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
  },
  analyzeBtn: { marginBottom: 14 },
  loadingBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.pink,
    borderRadius: 4,
    padding: 10,
    marginBottom: 14,
    alignItems: 'center',
  },
  loadingText: { fontFamily: fonts.body, fontSize: 16, color: colors.ink2 },
  errorBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.pink,
    borderRadius: 4,
    padding: 10,
    marginBottom: 14,
  },
  errorText: { fontFamily: fonts.body, fontSize: 14, color: colors.pink },
  previewSection: { marginBottom: 18 },
  sectionLabel: {
    fontFamily: fonts.chrome,
    fontSize: 10,
    color: colors.ink2,
    marginTop: 14,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  sizeRow: { flexDirection: 'row', gap: 12 },
  sizeItem: { alignItems: 'center', position: 'relative' },
  recommendedStamp: { marginTop: 6 },
  fitBox: { marginTop: 14 },
  fitBoxPad: { padding: 12 },
  fitBoxText: { fontFamily: fonts.chromeBold, fontSize: 13, color: colors.mint },
  ctaBtn: { marginTop: 14 },
  shopsTitle: {
    fontFamily: fonts.title,
    fontSize: 15,
    color: colors.ink,
    marginTop: 8,
    marginBottom: 6,
  },
  shopsList: {},
});
