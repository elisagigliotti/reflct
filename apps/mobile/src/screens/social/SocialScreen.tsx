// Battle / Social (battle.net) — NUOVA, spec reskin (packages/design-tokens/README.md #6).
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, borders, spacing } from '../../theme/theme';
import { BATTLE_PAIR, TRENDING } from '../../data/mockData';
import DesktopBackground from '../../ui/DesktopBackground';
import Menubar from '../../ui/Menubar';
import UiWindow from '../../ui/UiWindow';
import WinTitle from '../../ui/WinTitle';
import Tab from '../../ui/Tab';
import Btn95 from '../../ui/Btn95';
import Stamp from '../../ui/Stamp';
import Shot from '../../ui/Shot';
import { DualFitbar } from '../../ui/Fitbar';
import { FeedStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<FeedStackParamList, 'Social'>;

type SocialTab = 'Rate' | 'Battle' | 'Trending';

const EMOJI_VOTES: { glyph: string; count: number }[] = [
  { glyph: '🔥', count: 214 },
  { glyph: '😐', count: 32 },
  { glyph: '⏭', count: 18 },
];

export default function SocialScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<SocialTab>('Rate');
  const [voted, setVoted] = useState(false);

  const totalVotes = BATTLE_PAIR.votesA + BATTLE_PAIR.votesB;
  const ratioA = totalVotes ? BATTLE_PAIR.votesA / totalVotes : 0.5;

  return (
    <DesktopBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: 20 }]}
      >
        <Menubar menuItems={['Social', 'Vota', 'View']} />

        <UiWindow>
          <WinTitle label="battle.net — social" variant="teal" icon="⚔" />
          <View style={styles.pad}>
            <View style={styles.tabRow}>
              <Tab label="Rate" active={tab === 'Rate'} onPress={() => setTab('Rate')} />
              <Tab label="Battle" active={tab === 'Battle'} onPress={() => setTab('Battle')} />
              <Tab label="Trending" active={tab === 'Trending'} onPress={() => setTab('Trending')} />
            </View>

            {tab === 'Rate' && (
              <View>
                <UiWindow style={styles.rateCard}>
                  <Shot height={180} color={colors.pink} label="OUTFIT_07.BMP" />
                </UiWindow>
                <View style={styles.emojiRow}>
                  {EMOJI_VOTES.map((e) => (
                    <View key={e.glyph} style={styles.emojiItem}>
                      <Pressable style={styles.emojiBtn}>
                        <Text style={styles.emojiGlyph}>{e.glyph}</Text>
                      </Pressable>
                      <Text style={styles.emojiCount}>{e.count}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {tab === 'Battle' && (
              <View>
                <View style={styles.battleRow}>
                  <View style={[styles.battleCardWrap, { transform: [{ rotate: '-1deg' }] }]}>
                    <UiWindow>
                      <Shot height={140} color={colors.cyan} label={BATTLE_PAIR.itemAName} />
                    </UiWindow>
                  </View>
                  <Text style={styles.vsText}>VS</Text>
                  <View style={[styles.battleCardWrap, { transform: [{ rotate: '1deg' }] }]}>
                    <UiWindow>
                      <Shot height={140} color={colors.mint} label={BATTLE_PAIR.itemBName} />
                    </UiWindow>
                  </View>
                </View>

                <View style={styles.countdownRow}>
                  <Stamp label={BATTLE_PAIR.countdown} color={colors.ink} />
                </View>

                <DualFitbar ratioA={ratioA} />
                <View style={styles.voteLabelsRow}>
                  <Text style={styles.voteLabel}>{Math.round(ratioA * 100)}%</Text>
                  <Text style={styles.voteLabel}>{Math.round((1 - ratioA) * 100)}%</Text>
                </View>

                <Btn95
                  label={voted ? 'VOTATO ✓' : 'VOTA A'}
                  variant={voted ? 'cta' : 'default'}
                  disabled={voted}
                  block
                  style={styles.voteBtn}
                  onPress={() => setVoted(true)}
                />
              </View>
            )}

            {tab === 'Trending' && (
              <View style={styles.trendingGrid}>
                {TRENDING.map((t) => (
                  <View key={t.id} style={styles.trendingCell}>
                    <UiWindow>
                      <Shot height={130} color={t.shotColor} label={t.name} />
                      <View style={styles.trendingFooter}>
                        <Text style={styles.fireCount}>🔥 {t.fireCount}</Text>
                      </View>
                    </UiWindow>
                  </View>
                ))}
              </View>
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
  pad: { padding: spacing.windowPadding },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  rateCard: {
    marginBottom: 12,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  emojiItem: {
    alignItems: 'center',
    gap: 4,
  },
  emojiBtn: {
    width: 44,
    height: 44,
    borderWidth: borders.width,
    borderColor: colors.ink,
    borderRadius: borders.radius.button,
    backgroundColor: colors.win,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiGlyph: {
    fontSize: 20,
  },
  emojiCount: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink2,
  },
  battleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  battleCardWrap: {
    flex: 1,
  },
  vsText: {
    fontFamily: fonts.pixel,
    fontSize: 16,
    color: colors.pink,
  },
  countdownRow: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 10,
  },
  voteLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  voteLabel: {
    fontFamily: fonts.chrome,
    fontSize: 10,
    color: colors.ink2,
  },
  voteBtn: {
    marginTop: 14,
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.masonryColumnGap,
  },
  trendingCell: {
    width: '47%',
  },
  trendingFooter: {
    padding: 8,
    backgroundColor: colors.win,
  },
  fireCount: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
  },
});
