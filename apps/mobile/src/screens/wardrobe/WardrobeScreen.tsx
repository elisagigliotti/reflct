// Guardaroba / Armadio (wardrobe.dat) — HIFI, fedele a docs/design-reference (sezione "3 · Armadio").
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing } from '../../theme/theme';
import { useAppState } from '../../state/AppStateContext';
import { WARDROBE_FOLDERS } from '../../data/mockData';
import DesktopBackground from '../../ui/DesktopBackground';
import Menubar from '../../ui/Menubar';
import UiWindow from '../../ui/UiWindow';
import WinTitle from '../../ui/WinTitle';
import Folder from '../../ui/Folder';
import FeedCard from '../../ui/FeedCard';
import Masonry2 from '../../ui/Masonry2';
import Btn95 from '../../ui/Btn95';
import { WardrobeStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<WardrobeStackParamList, 'WardrobeHome'>;

export default function WardrobeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { liked, likedItems, toggleLike, likedCount, setTryItem } = useAppState();

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
        <Menubar menuItems={['Armadio', 'Look', 'Ordina']} />

        <UiWindow style={styles.blockGap}>
          <WinTitle label="wardrobe.dat — il mio armadio" icon="🗄" />
          <View style={styles.pad}>
            <View style={styles.statsRow}>
              <View style={[styles.statCard]}>
                <Text style={[styles.statNumber, { color: colors.pink }]}>{likedCount}</Text>
                <Text style={styles.statLabel}>SALVATI</Text>
              </View>
              <View style={[styles.statCard, styles.statCardMint]}>
                <Text style={[styles.statNumber, { color: colors.mint }]}>7</Text>
                <Text style={styles.statLabel}>LOOK</Text>
              </View>
              <View style={[styles.statCard]}>
                <Text style={[styles.statNumber, { color: colors.cyan }]}>42</Text>
                <Text style={styles.statLabel}>PROVATI</Text>
              </View>
            </View>

            <Text style={styles.foldersTitle}>Cartelle</Text>
            <View style={styles.foldersRow}>
              {WARDROBE_FOLDERS.map((f) => (
                <Folder key={f.id} label={f.label} count={f.count} />
              ))}
            </View>

            <Btn95
              label="pricewatch.sys — prezzi ›"
              variant="cyan"
              block
              style={styles.priceTrackerBtn}
              onPress={() => navigation.navigate('PriceTracker')}
            />
          </View>
        </UiWindow>

        <UiWindow>
          <WinTitle label="salvati.lst" />
          <View style={styles.savedPad}>
            {likedItems.length === 0 ? (
              <Text style={styles.emptyState}>nessun capo salvato — metti ♥ nel feed!</Text>
            ) : (
              <Masonry2
                data={likedItems}
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
      </ScrollView>
    </DesktopBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 12 },
  blockGap: { marginBottom: spacing.blockGap },
  pad: { padding: spacing.windowPadding },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 4,
    backgroundColor: colors.win,
  },
  statCardMint: {
    backgroundColor: colors.winAlt,
  },
  statNumber: {
    fontFamily: fonts.pixel,
    fontSize: 22,
  },
  statLabel: {
    fontFamily: fonts.chrome,
    fontSize: 8,
    color: colors.ink2,
    marginTop: 4,
    letterSpacing: 0.4,
  },
  foldersTitle: {
    fontFamily: fonts.title,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 8,
  },
  foldersRow: {
    flexDirection: 'row',
    gap: spacing.folderGridGap,
  },
  priceTrackerBtn: {
    marginTop: 16,
  },
  savedPad: {
    padding: spacing.windowPadding,
  },
  emptyState: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
