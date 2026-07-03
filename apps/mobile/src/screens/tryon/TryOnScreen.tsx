// Prova / Try-On AR (tryon.exe) — HIFI, + placeholder AR (corner marker, REC badge).
// Il capo viene da AppStateContext (dati reali, vedi state/AppStateContext.tsx):
// se non arriva un id valido dai param di navigazione, si usa il primo capo
// disponibile appena il feed e' pronto (stesso schema del web, vedi
// apps/web/src/app/features/tryon/tryon.component.ts).
import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, spacing } from '../../theme/theme';
import { useAppState } from '../../state/AppStateContext';
import DesktopBackground from '../../ui/DesktopBackground';
import Menubar from '../../ui/Menubar';
import UiWindow from '../../ui/UiWindow';
import WinTitle from '../../ui/WinTitle';
import Stamp from '../../ui/Stamp';
import Btn95 from '../../ui/Btn95';
import Fitbar from '../../ui/Fitbar';
import Swatch from '../../ui/Swatch';
import { SizePillSelectable } from '../../ui/SizePill';
import { SIZES, TRYON_COLORS } from '../../data/mockData';
import { TryOnStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<TryOnStackParamList, 'TryOnHome'>;

export default function TryOnScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const {
    items,
    tryItemId,
    setTryItem,
    trySize,
    setTrySize,
    tryColorIndex,
    setTryColor,
    tryColor,
    liked,
    toggleLike,
    getItem,
  } = useAppState();

  const paramItemId = route.params?.itemId;
  const activeItemId = paramItemId ?? tryItemId;
  const item = (activeItemId != null ? getItem(activeItemId) : undefined) ?? items[0];

  useEffect(() => {
    if (paramItemId && paramItemId !== tryItemId) {
      setTryItem(paramItemId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramItemId]);

  const fitPct = 92;
  const isLiked = item ? !!liked[String(item.id)] : false;

  if (!item) {
    return (
      <DesktopBackground>
        <View style={[styles.loadingWrap, { paddingTop: insets.top + 10 }]}>
          <Text style={styles.loadingText}>caricamento capo…</Text>
        </View>
      </DesktopBackground>
    );
  }

  return (
    <DesktopBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 10, paddingBottom: 20 }]}
      >
        <Menubar menuItems={['Cabina', 'AR', 'View']} />

        <UiWindow>
          <WinTitle label="tryon.exe — cabina di prova" icon="✦" />
          <View style={styles.pad}>
            {/* Viewport avatar / AR placeholder */}
            <View style={styles.viewport}>
              <View style={styles.viewportDither} />
              {/* corner marker AR: 4 angoli tratteggiati */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />

              <View style={styles.viewportTopRow}>
                <Stamp label="● REC · AR LIVE" color={colors.ink} style={styles.recStamp} />
                <Stamp label="AVATAR_LIVE.CAM" color={colors.ink} style={styles.recStamp} />
              </View>

              <Text style={styles.avatarPlaceholderText}>AVATAR_LIVE.CAM</Text>

              <View style={styles.itemLabel}>
                <Text style={styles.itemLabelText}>{item.name}</Text>
              </View>
            </View>

            {/* Fit score */}
            <View style={styles.fitHeaderRow}>
              <Text style={styles.fitHeaderLabel}>Fit sul tuo avatar</Text>
              <Text style={styles.fitHeaderPct}>{fitPct}%</Text>
            </View>
            <Fitbar filledRatio={fitPct / 100} />

            {/* Readout misure */}
            <UiWindow variant="mint" style={styles.measuresWin} noShadow>
              <View style={styles.measuresPad}>
                <View style={styles.measureRow}>
                  <Text style={styles.measureKey}>spalle</Text>
                  <Text style={[styles.measureVal, { color: colors.mint }]}>PERFETTO</Text>
                </View>
                <View style={styles.measureRow}>
                  <Text style={styles.measureKey}>vita</Text>
                  <Text style={[styles.measureVal, { color: colors.mint }]}>OK</Text>
                </View>
                <View style={styles.measureRow}>
                  <Text style={styles.measureKey}>lunghezza</Text>
                  <Text style={[styles.measureVal, { color: colors.warn }]}>-2 cm</Text>
                </View>
              </View>
            </UiWindow>

            {/* Selettore taglia */}
            <Text style={styles.sectionLabel}>Taglia</Text>
            <View style={styles.sizeRow}>
              {SIZES.map((s) => (
                <SizePillSelectable key={s} label={s} active={s === trySize} onPress={() => setTrySize(s)} />
              ))}
            </View>

            {/* Selettore colore */}
            <Text style={styles.sectionLabel}>Colore</Text>
            <View style={styles.colorRow}>
              {TRYON_COLORS.map((c, i) => (
                <Swatch key={c} color={c} active={i === tryColorIndex} onPress={() => setTryColor(i)} />
              ))}
            </View>

            {/* Azioni */}
            <View style={styles.actionsRow}>
              <Btn95 label="↻ RUOTA" variant="cyan" />
              <Btn95
                label={isLiked ? '♥ SALVA' : '♡ SALVA'}
                onPress={() => toggleLike(item.id)}
              />
            </View>
            <Btn95
              label={`AGGIUNGI · ${item.price}`}
              variant="cta"
              block
              style={styles.ctaBlock}
              onPress={() => navigation.navigate('Share', { itemId: item.id })}
            />
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
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  loadingText: { fontFamily: fonts.body, fontSize: 16, color: colors.muted },
  viewport: {
    height: 300,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 4,
    backgroundColor: colors.win,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  viewportDither: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F7C9DE',
    opacity: 0.9,
  },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: colors.ink,
  },
  cornerTL: { top: 8, left: 8, borderTopWidth: 2, borderLeftWidth: 2, borderStyle: 'dashed' },
  cornerTR: { top: 8, right: 8, borderTopWidth: 2, borderRightWidth: 2, borderStyle: 'dashed' },
  cornerBL: { bottom: 8, left: 8, borderBottomWidth: 2, borderLeftWidth: 2, borderStyle: 'dashed' },
  cornerBR: { bottom: 8, right: 8, borderBottomWidth: 2, borderRightWidth: 2, borderStyle: 'dashed' },
  viewportTopRow: {
    position: 'absolute',
    top: 8,
    left: 34,
    right: 34,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recStamp: {
    backgroundColor: 'rgba(251,220,232,0.9)',
    fontSize: 8,
  },
  avatarPlaceholderText: {
    position: 'absolute',
    top: '48%',
    alignSelf: 'center',
    fontFamily: fonts.chrome,
    fontSize: 10,
    color: colors.ink2,
    opacity: 0.6,
  },
  itemLabel: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: colors.win,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  itemLabelText: {
    fontFamily: fonts.title,
    fontSize: 15,
    color: colors.ink,
    textAlign: 'center',
  },
  fitHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  fitHeaderLabel: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.ink,
  },
  fitHeaderPct: {
    fontFamily: fonts.pixel,
    fontSize: 18,
    color: colors.mint,
  },
  measuresWin: {
    marginTop: 12,
  },
  measuresPad: {
    padding: 12,
    gap: 8,
  },
  measureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  measureKey: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
  },
  measureVal: {
    fontFamily: fonts.chromeBold,
    fontSize: 11,
  },
  sectionLabel: {
    fontFamily: fonts.chrome,
    fontSize: 10,
    color: colors.ink2,
    marginTop: 14,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 16,
  },
  ctaBlock: {
    marginTop: 10,
  },
});
