// Feed (home.exe / wardrobe.exe) — HIFI, fedele a docs/design-reference (sezione "1 · Feed").
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing } from '../../theme/theme';
import { useAppState } from '../../state/AppStateContext';
import { FILTERS } from '../../data/mockData';
import DesktopBackground from '../../ui/DesktopBackground';
import Menubar from '../../ui/Menubar';
import UiWindow from '../../ui/UiWindow';
import WinTitle from '../../ui/WinTitle';
import Stamp from '../../ui/Stamp';
import Tab from '../../ui/Tab';
import Btn95 from '../../ui/Btn95';
import FeedCard from '../../ui/FeedCard';
import Masonry2 from '../../ui/Masonry2';
import { FeedStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<FeedStackParamList, 'FeedHome'>;

export default function FeedScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { items, liked, loading, error, toggleLike, filter, setFilter, scanBannerVisible, dismissScanBanner, setTryItem } =
    useAppState();

  const openItem = (id: string | number) => {
    setTryItem(id);
    navigation.getParent()?.navigate('Prova', { screen: 'TryOnHome', params: { itemId: id } });
  };

  return (
    <DesktopBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: 20 }]}
      >
        <Menubar menuItems={['File', 'Fit', 'View']} />

        {/* Finestra saluto */}
        <UiWindow style={styles.blockGap}>
          <WinTitle label="C:\reflct\home.exe" />
          <View style={styles.pad}>
            <Text style={styles.greeting}>&gt; bentornata,</Text>
            <Text style={styles.username}>
              giulia<Text style={{ color: colors.pink }}>_</Text>
            </Text>
            <View style={styles.greetRow}>
              <Stamp label="avatar: ON" color={colors.cyan} />
              <Text style={styles.mutedNote}>42 capi provati questo mese</Text>
            </View>
          </View>
        </UiWindow>

        {/* Dialog body-scan */}
        {scanBannerVisible && (
          <UiWindow variant="default" style={styles.blockGap}>
            <WinTitle label="system message" variant="teal" />
            <View style={styles.scanBody}>
              <View style={styles.heartIcon}>
                <Text style={styles.heartIconGlyph}>♥</Text>
              </View>
              <View style={styles.scanText}>
                <Text style={styles.scanTitle}>Crea il tuo avatar 3D</Text>
                <Text style={styles.scanDesc}>
                  Fai il body-scan e prova i capi su di te. Ci vogliono 60 secondi.
                </Text>
                <View style={styles.heartMeter}>
                  <Text style={[styles.heartMeterGlyph, { color: colors.pink }]}>♥</Text>
                  <Text style={[styles.heartMeterGlyph, { color: colors.pink }]}>♥</Text>
                  <Text style={[styles.heartMeterGlyph, { color: colors.cyan }]}>♥</Text>
                  <Text style={[styles.heartMeterGlyph, { color: colors.mint }]}>♥</Text>
                  <Text style={[styles.heartMeterGlyph, { color: colors.lav }]}>♡</Text>
                  <Text style={[styles.heartMeterGlyph, { color: colors.muted }]}>♡</Text>
                </View>
              </View>
            </View>
            <View style={styles.scanActions}>
              <Btn95
                label="SCAN NOW"
                variant="cta"
                onPress={() => navigation.getParent()?.navigate('Prova', { screen: 'TryOnHome' })}
              />
              <Btn95 label="Later" onPress={dismissScanBanner} />
            </View>
          </UiWindow>
        )}

        {/* Finestra guardaroba/feed */}
        <UiWindow variant="mint" style={styles.wardrobeWin}>
          <WinTitle label="wardrobe.exe — sfoglia" variant="teal" icon="✦" />

          <View style={styles.filterStripWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterStrip}>
              {FILTERS.map((f) => (
                <Tab key={f} label={f} active={f === filter} onPress={() => setFilter(f)} />
              ))}
            </ScrollView>
          </View>

          <View style={styles.masonryWrap}>
            {loading ? (
              <Text style={styles.statusText}>caricamento capi…</Text>
            ) : error ? (
              <Text style={[styles.statusText, styles.statusTextError]}>{error}</Text>
            ) : (
              <Masonry2
                data={items}
                keyExtractor={(it) => String(it.id)}
                renderItem={(it) => (
                  <FeedCard
                    item={it}
                    liked={!!liked[String(it.id)]}
                    onPress={() => openItem(it.id)}
                    onToggleLike={() => toggleLike(it.id)}
                  />
                )}
              />
            )}
          </View>
        </UiWindow>

        <Pressable onPress={() => navigation.navigate('Import')} style={styles.importLink}>
          <Text style={styles.importLinkText}>+ importa da un link</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Social')} style={styles.socialLink}>
          <Text style={styles.importLinkText}>battle.net — social ›</Text>
        </Pressable>
      </ScrollView>
    </DesktopBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 12,
  },
  blockGap: {
    marginBottom: spacing.blockGap,
  },
  pad: {
    padding: spacing.windowPadding,
  },
  greeting: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.ink2,
    lineHeight: 18,
  },
  username: {
    fontFamily: fonts.pixel,
    fontSize: 20,
    marginTop: 6,
    color: colors.ink,
    lineHeight: 25,
  },
  greetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 9,
    flexWrap: 'wrap',
  },
  mutedNote: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.muted,
  },
  scanBody: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    padding: spacing.windowPadding,
  },
  heartIcon: {
    width: 46,
    height: 46,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 4,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIconGlyph: {
    fontSize: 22,
    color: colors.white,
  },
  scanText: {
    flex: 1,
  },
  scanTitle: {
    fontFamily: fonts.titleBold,
    fontSize: 18,
    color: colors.ink,
    lineHeight: 21,
  },
  scanDesc: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink2,
    marginTop: 3,
    lineHeight: 18,
  },
  heartMeter: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 8,
  },
  heartMeterGlyph: {
    fontSize: 13,
    lineHeight: 14,
  },
  scanActions: {
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: spacing.windowPadding,
    paddingBottom: spacing.windowPadding,
  },
  wardrobeWin: {
    paddingBottom: 4,
  },
  filterStripWrap: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  filterStrip: {
    gap: 8,
    paddingBottom: 8,
  },
  masonryWrap: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 10,
  },
  statusText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  statusTextError: {
    color: colors.warn,
  },
  importLink: {
    marginTop: 14,
    alignSelf: 'center',
  },
  socialLink: {
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'center',
  },
  importLinkText: {
    fontFamily: fonts.chrome,
    fontSize: 11,
    color: colors.ink2,
    textDecorationLine: 'underline',
  },
});
