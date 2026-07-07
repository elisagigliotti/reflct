// Price Tracker (pricewatch.sys) — NUOVA, spec reskin (packages/design-tokens/README.md #8).
// Dati REALI: GET /api/v1/garments (filtrati per prezzoPrecedente) +
// GET /api/v1/garments/{id}/price-history + GET/POST /api/v1/price-alerts.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, borders, spacing } from '../../theme/theme';
import DesktopBackground from '../../ui/DesktopBackground';
import Menubar from '../../ui/Menubar';
import UiWindow from '../../ui/UiWindow';
import WinTitle from '../../ui/WinTitle';
import Shot from '../../ui/Shot';
import Stamp from '../../ui/Stamp';
import Btn95 from '../../ui/Btn95';
import { WardrobeStackParamList } from '../../navigation/types';
import {
  listGarments,
  getPriceHistory,
  GarmentItemResponse,
} from '../../api/garments';
import { listMyAlerts, createAlert, PriceAlertResponse } from '../../api/priceAlerts';
import { toFeedItem } from '../../data/garmentVisuals';
import { FeedItem } from '../../data/models';

type Props = NativeStackScreenProps<WardrobeStackParamList, 'PriceTracker'>;

const SPARK_COLORS = [colors.pink, colors.cyan, colors.mint, colors.yellow, colors.lav];

interface TrackedItem extends FeedItem {
  historyPrices: number[];
  isAllTimeLow: boolean;
  alertThreshold: number | null;
}

export default function PriceTrackerScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<TrackedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thresholds, setThresholds] = useState<Record<string, string>>({});

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [page, alerts] = await Promise.all([
        listGarments(),
        listMyAlerts().catch((): PriceAlertResponse[] => []),
      ]);
      // Solo i capi con storico prezzo (prezzoPrecedente != null)
      const tracked: GarmentItemResponse[] = page.content.filter((g) => g.prezzoPrecedente != null);
      const histories = await Promise.all(tracked.map((g) => getPriceHistory(g.id)));
      const built: TrackedItem[] = tracked.map((g, i) => {
        const feedItem = toFeedItem(g);
        const hist = histories[i].map((h) => h.prezzo);
        const allPrices = [...hist, g.prezzoAttuale ?? 0];
        const isAllTimeLow = (g.prezzoAttuale ?? Infinity) <= Math.min(...allPrices);
        const alert = alerts.find((a) => a.garmentId === g.id);
        return {
          ...feedItem,
          historyPrices: allPrices,
          isAllTimeLow,
          alertThreshold: alert ? alert.soglia : null,
        };
      });
      setItems(built);
    } catch {
      setError('Impossibile caricare i capi monitorati. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleSetAlert = (item: TrackedItem) => {
    const raw = thresholds[String(item.id)];
    const parsed = Number(raw);
    if (!raw || !Number.isFinite(parsed) || parsed <= 0) return;
    createAlert({ garmentId: String(item.id), soglia: parsed })
      .then((alert) => {
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, alertThreshold: alert.soglia } : it)),
        );
        setThresholds((s) => ({ ...s, [String(item.id)]: '' }));
      })
      .catch(() => {/* silenzioso */});
  };

  const maxHistory = (prices: number[]) => Math.max(...prices, 1);

  return (
    <DesktopBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: 20 }]}
      >
        <Menubar menuItems={['Prezzi', 'Alert', 'View']} />

        <UiWindow>
          <WinTitle label="pricewatch.sys — capi monitorati" icon="📉" />
          <View style={styles.pad}>
            {loading && <ActivityIndicator color={colors.pink} style={{ marginVertical: 24 }} />}
            {error && <Text style={styles.errorText}>{error}</Text>}

            {!loading && items.length === 0 && !error && (
              <Text style={styles.emptyText}>
                Nessun capo con variazione di prezzo. Importa capi dal feed per vederli qui.
              </Text>
            )}

            {items.map((item) => {
              const maxH = maxHistory(item.historyPrices);
              return (
                <View key={String(item.id)} style={styles.rowWin}>
                  <UiWindow noShadow>
                    <View style={styles.rowContent}>
                      <View style={[styles.thumbWrap, { transform: [{ rotate: '-4deg' }] }]}>
                        <Shot height={64} color={item.shotColor} />
                      </View>
                      <View style={styles.rowInfo}>
                        <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.rowBrand}>{item.brand}</Text>
                        <View style={styles.priceRow}>
                          <Text style={[styles.price, { color: item.isAllTimeLow ? colors.mint : colors.pink }]}>
                            {item.price}
                          </Text>
                          {item.old ? <Text style={styles.oldPrice}>{item.old}</Text> : null}
                        </View>
                        {item.isAllTimeLow && (
                          <Stamp label="▼ minimo storico" color={colors.mint} style={styles.lowStamp} />
                        )}
                      </View>

                      <View style={styles.sparkBox}>
                        {item.historyPrices.map((v, i) => (
                          <View
                            key={i}
                            style={[
                              styles.sparkBar,
                              {
                                height: Math.max(4, (v / maxH) * 36),
                                backgroundColor: SPARK_COLORS[i % SPARK_COLORS.length],
                              },
                            ]}
                          />
                        ))}
                      </View>
                    </View>

                    <View style={styles.alertRow}>
                      <Text style={styles.alertLabel}>Alert sotto</Text>
                      <TextInput
                        style={styles.alertInput}
                        keyboardType="numeric"
                        placeholder={item.alertThreshold ? String(item.alertThreshold) : '--'}
                        placeholderTextColor={colors.muted}
                        value={thresholds[String(item.id)] ?? ''}
                        onChangeText={(v) =>
                          setThresholds((s) => ({ ...s, [String(item.id)]: v }))
                        }
                      />
                      <Btn95 label="IMPOSTA" onPress={() => handleSetAlert(item)} />
                    </View>
                  </UiWindow>
                </View>
              );
            })}
          </View>
        </UiWindow>
      </ScrollView>
    </DesktopBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 12 },
  pad: { padding: spacing.windowPadding, gap: spacing.blockGap },
  rowWin: { marginBottom: spacing.blockGap },
  rowContent: { flexDirection: 'row', gap: 10, padding: 10, alignItems: 'flex-start' },
  thumbWrap: { width: 56, height: 64, borderRadius: 4, overflow: 'hidden' },
  rowInfo: { flex: 1 },
  rowName: { fontFamily: fonts.title, fontSize: 14, color: colors.ink },
  rowBrand: { fontFamily: fonts.chrome, fontSize: 8, color: colors.muted, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 6 },
  price: { fontFamily: fonts.body, fontSize: 20 },
  oldPrice: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, textDecorationLine: 'line-through' },
  lowStamp: { marginTop: 6 },
  sparkBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    width: 70,
    height: 40,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.ink,
    borderRadius: 4,
    padding: 4,
  },
  sparkBar: { flex: 1, borderRadius: 1 },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(42,36,56,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  alertLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.ink2 },
  alertInput: {
    width: 56,
    borderWidth: borders.width,
    borderColor: colors.ink,
    borderRadius: 3,
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.ink2, marginVertical: 16, textAlign: 'center' },
  errorText: { fontFamily: fonts.body, fontSize: 13, color: colors.pink, marginBottom: 10 },
});
