// Battle / Social (battle.net) — NUOVA, spec reskin (packages/design-tokens/README.md #6).
// Dati REALI: GET /api/v1/social/posts, POST /social/vote, POST /social/post.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, borders, spacing } from '../../theme/theme';
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
import { listPosts, vote, createPost, SocialPostResponse, TipoSocialPost } from '../../api/social';
import { startTryOn } from '../../api/tryon';
import { useAppState } from '../../state/AppStateContext';
import { deriveShotColor } from '../../data/garmentVisuals';

type Props = NativeStackScreenProps<FeedStackParamList, 'Social'>;
type SocialTab = 'Rate' | 'Battle' | 'Trending';

function parseVoti(json: string): Record<string, number> {
  try { return JSON.parse(json); } catch { return {}; }
}

export default function SocialScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { items: feedItems } = useAppState();
  const [tab, setTab] = useState<SocialTab>('Rate');
  const [posts, setPosts] = useState<SocialPostResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const loadPosts = useCallback((tipo: TipoSocialPost) => {
    setLoading(true);
    setError(null);
    listPosts(tipo)
      .then(setPosts)
      .catch(() => setError('Impossibile caricare i post. Riprova più tardi.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab === 'Rate') loadPosts('RATE');
    else if (tab === 'Battle') loadPosts('BATTLE');
    // Trending usa i capi del feed
  }, [tab, loadPosts]);

  const handleVote = (postId: string, opzione: string) => {
    if (votedIds.has(postId)) return;
    vote({ postId, opzione })
      .then((updated) => {
        setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
        setVotedIds((prev) => new Set(prev).add(postId));
      })
      .catch(() => {/* voto già dato o errore di rete: silenzioso */});
  };

  const handlePostRandom = () => {
    if (feedItems.length === 0 || posting) return;
    const item = feedItems[Math.floor(Math.random() * feedItems.length)];
    const tipo: TipoSocialPost = tab === 'Battle' ? 'BATTLE' : 'RATE';
    setPosting(true);
    setError(null);
    startTryOn({ garmentId: String(item.id), fotoUrl: 'https://reflct.app/placeholder/avatar.jpg' })
      .then((session) => createPost({ sessionId: session.id, tipo }))
      .then(() => loadPosts(tipo))
      .catch(() => setError('Impossibile creare il post.'))
      .finally(() => setPosting(false));
  };

  const ratePost = posts[0] ?? null;
  const battlePost = posts[0] ?? null;
  const trendingItems = feedItems.slice(0, 4);

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

            {loading && <ActivityIndicator color={colors.pink} style={{ marginVertical: 24 }} />}
            {error && <Text style={styles.errorText}>{error}</Text>}

            {!loading && tab === 'Rate' && (
              <View>
                {ratePost ? (
                  <>
                    <UiWindow style={styles.rateCard}>
                      <Shot
                        height={180}
                        color={deriveShotColor(ratePost.garmentId)}
                        label={ratePost.garmentNome.toUpperCase().slice(0, 12) + '.BMP'}
                      />
                    </UiWindow>
                    <View style={styles.emojiRow}>
                      {(['🔥', '😐', '⏭'] as const).map((glyph, i) => {
                        const keys = ['fire', 'meh', 'skip'] as const;
                        const voti = parseVoti(ratePost.votiJson);
                        return (
                          <View key={glyph} style={styles.emojiItem}>
                            <Pressable
                              style={styles.emojiBtn}
                              onPress={() => handleVote(ratePost.id, keys[i])}
                              disabled={votedIds.has(ratePost.id)}
                            >
                              <Text style={styles.emojiGlyph}>{glyph}</Text>
                            </Pressable>
                            <Text style={styles.emojiCount}>{voti[keys[i]] ?? 0}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </>
                ) : (
                  <Text style={styles.emptyText}>Nessun outfit da votare.</Text>
                )}
                <Btn95
                  label={posting ? 'posting…' : 'POSTA UN CAPO'}
                  variant="cyan"
                  block
                  style={styles.postBtn}
                  onPress={handlePostRandom}
                  disabled={posting}
                />
              </View>
            )}

            {!loading && tab === 'Battle' && (
              <View>
                {battlePost ? (() => {
                  const voti = parseVoti(battlePost.votiJson);
                  const a = voti['a'] ?? 0;
                  const b = voti['b'] ?? 0;
                  const total = a + b || 1;
                  const ratioA = a / total;
                  const alreadyVoted = votedIds.has(battlePost.id);
                  return (
                    <>
                      <View style={styles.battleRow}>
                        <View style={[styles.battleCardWrap, { transform: [{ rotate: '-1deg' }] }]}>
                          <UiWindow>
                            <Shot height={140} color={deriveShotColor(battlePost.garmentId)} label={battlePost.garmentNome.toUpperCase().slice(0, 10)} />
                          </UiWindow>
                        </View>
                        <Text style={styles.vsText}>VS</Text>
                        <View style={[styles.battleCardWrap, { transform: [{ rotate: '1deg' }] }]}>
                          <UiWindow>
                            <Shot height={140} color={colors.mint} label="SFIDANTE" />
                          </UiWindow>
                        </View>
                      </View>
                      <DualFitbar ratioA={ratioA} />
                      <View style={styles.voteLabelsRow}>
                        <Text style={styles.voteLabel}>{Math.round(ratioA * 100)}%</Text>
                        <Text style={styles.voteLabel}>{Math.round((1 - ratioA) * 100)}%</Text>
                      </View>
                      <View style={styles.battleBtns}>
                        <Btn95
                          label={alreadyVoted ? 'VOTATO ✓' : 'VOTA A'}
                          variant={alreadyVoted ? 'cta' : 'default'}
                          disabled={alreadyVoted}
                          style={{ flex: 1 }}
                          onPress={() => handleVote(battlePost.id, 'a')}
                        />
                        <Btn95
                          label={alreadyVoted ? 'VOTATO ✓' : 'VOTA B'}
                          variant={alreadyVoted ? 'cta' : 'default'}
                          disabled={alreadyVoted}
                          style={{ flex: 1 }}
                          onPress={() => handleVote(battlePost.id, 'b')}
                        />
                      </View>
                    </>
                  );
                })() : (
                  <Text style={styles.emptyText}>Nessun battle attivo.</Text>
                )}
                <Btn95
                  label={posting ? 'posting…' : 'CREA BATTLE'}
                  variant="cyan"
                  block
                  style={styles.postBtn}
                  onPress={handlePostRandom}
                  disabled={posting}
                />
              </View>
            )}

            {tab === 'Trending' && (
              <View style={styles.trendingGrid}>
                {trendingItems.length === 0 ? (
                  <Text style={styles.emptyText}>Nessun capo nel feed.</Text>
                ) : trendingItems.map((t) => (
                  <View key={String(t.id)} style={styles.trendingCell}>
                    <UiWindow>
                      <Shot height={130} color={t.shotColor} label={t.shotLabel} />
                      <View style={styles.trendingFooter}>
                        <Text style={styles.fireCount}>🔥 {t.name}</Text>
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
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  rateCard: { marginBottom: 12 },
  emojiRow: { flexDirection: 'row', justifyContent: 'space-around' },
  emojiItem: { alignItems: 'center', gap: 4 },
  emojiBtn: {
    width: 44, height: 44,
    borderWidth: borders.width, borderColor: colors.ink,
    borderRadius: borders.radius.button, backgroundColor: colors.win,
    alignItems: 'center', justifyContent: 'center',
  },
  emojiGlyph: { fontSize: 20 },
  emojiCount: { fontFamily: fonts.body, fontSize: 14, color: colors.ink2 },
  battleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  battleCardWrap: { flex: 1 },
  vsText: { fontFamily: fonts.pixel, fontSize: 16, color: colors.pink },
  voteLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  voteLabel: { fontFamily: fonts.chrome, fontSize: 10, color: colors.ink2 },
  battleBtns: { flexDirection: 'row', gap: 8, marginTop: 14 },
  postBtn: { marginTop: 16 },
  emptyText: { fontFamily: fonts.body, fontSize: 14, color: colors.ink2, marginVertical: 16, textAlign: 'center' },
  errorText: { fontFamily: fonts.body, fontSize: 13, color: colors.pink, marginBottom: 10 },
  trendingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.masonryColumnGap },
  trendingCell: { width: '47%' },
  trendingFooter: { padding: 8, backgroundColor: colors.win },
  fireCount: { fontFamily: fonts.body, fontSize: 14, color: colors.ink },
});
