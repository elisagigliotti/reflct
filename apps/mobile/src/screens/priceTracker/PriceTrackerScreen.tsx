// Price Tracker (pricewatch.sys) — NUOVA, spec reskin (packages/design-tokens/README.md #8).
import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, borders, spacing } from '../../theme/theme';
import { FEED, PRICE_WATCH } from '../../data/mockData';
import DesktopBackground from '../../ui/DesktopBackground';
import Menubar from '../../ui/Menubar';
import UiWindow from '../../ui/UiWindow';
import WinTitle from '../../ui/WinTitle';
import Shot from '../../ui/Shot';
import Stamp from '../../ui/Stamp';
import Btn95 from '../../ui/Btn95';
import { WardrobeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<WardrobeStackParamList, 'PriceTracker'>;

const SPARK_COLORS = [colors.pink, colors.cyan, colors.mint, colors.yellow, colors.lav];

export default function PriceTrackerScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [thresholds, setThresholds] = useState<Record<number, string>>({});

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
            {PRICE_WATCH.map((pw) => {
              const item = FEED.find((f) => f.id === pw.feedItemId);
              if (!item) return null;
              const isDown = !!item.old;
              return (
                <View key={pw.id} style={styles.rowWin}>
                  <UiWindow noShadow>
                    <View style={styles.rowContent}>
                      <View style={[styles.thumbWrap, { transform: [{ rotate: '-4deg' }] }]}>
                        <Shot height={64} color={item.shotColor} />
                      </View>
                      <View style={styles.rowInfo}>
                        <Text style={styles.rowName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.rowBrand}>{item.brand}</Text>
                        <View style={styles.priceRow}>
                          <Text style={[styles.price, { color: isDown ? colors.mint : colors.pink }]}>
                            {item.price}
                          </Text>
                          {item.old ? <Text style={styles.oldPrice}>{item.old}</Text> : null}
                        </View>
                        {pw.isHistoricLow && <Stamp label="▼ minimo storico" color={colors.mint} style={styles.lowStamp} />}
                      </View>

                      <View style={styles.sparkBox}>
                        {pw.sparkline.map((v, i) => (
                          <View
                            key={i}
                            style={[
                              styles.sparkBar,
                              { height: Math.max(4, v * 36), backgroundColor: SPARK_COLORS[i % SPARK_COLORS.length] },
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
                        placeholder={pw.alertThreshold ? String(pw.alertThreshold) : '--'}
                        placeholderTextColor={colors.muted}
                        value={thresholds[pw.id] ?? ''}
                        onChangeText={(v) => setThresholds((s) => ({ ...s, [pw.id]: v }))}
                      />
                      <Btn95 label="IMPOSTA" />
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
  rowWin: {
    marginBottom: spacing.blockGap,
  },
  rowContent: {
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    alignItems: 'flex-start',
  },
  thumbWrap: {
    width: 56,
    height: 64,
    borderRadius: 4,
    overflow: 'hidden',
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontFamily: fonts.title,
    fontSize: 14,
    color: colors.ink,
  },
  rowBrand: {
    fontFamily: fonts.chrome,
    fontSize: 8,
    color: colors.muted,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 6,
  },
  price: {
    fontFamily: fonts.body,
    fontSize: 20,
  },
  oldPrice: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  lowStamp: {
    marginTop: 6,
  },
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
  sparkBar: {
    flex: 1,
    borderRadius: 1,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(42,36,56,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  alertLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink2,
  },
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
});
