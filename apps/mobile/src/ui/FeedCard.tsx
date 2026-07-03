// Card capo (mini-finestra ripetuta in Feed/Armadio/Import), stile .win.win--pop.
// Cliccabile -> naviga a Prova con l'id del capo.
import React, { useState } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { colors, fonts, borders, shadowOffsets } from '../theme/theme';
import WinTitle from './WinTitle';
import Shot from './Shot';
import { SizePillBadge } from './SizePill';
import Stamp from './Stamp';
import { FeedItem } from '../data/models';

interface FeedCardProps {
  item: FeedItem;
  liked: boolean;
  onPress: () => void;
  onToggleLike: () => void;
}

export default function FeedCard({ item, liked, onPress, onToggleLike }: FeedCardProps) {
  const [pressed, setPressed] = useState(false);
  const rotate = `${item.rot}deg`;
  const translate = pressed ? { x: -1, y: -2 } : { x: 0, y: 0 };

  const hasDrop = !!item.old;
  const priceColor = hasDrop ? colors.mint : colors.ink;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={styles.wrap}
    >
      <View
        pointerEvents="none"
        style={[
          styles.shadow,
          pressed && { top: shadowOffsets.windowHover.y, left: shadowOffsets.windowHover.x, right: -shadowOffsets.windowHover.x, bottom: -shadowOffsets.windowHover.y },
        ]}
      />
      <View
        style={[
          styles.card,
          { transform: [{ rotate }, { translateX: translate.x }, { translateY: translate.y }] },
        ]}
      >
        <WinTitle label={item.shotLabel.toLowerCase().replace('.bmp', '')} compact />

        <View style={styles.shotArea}>
          <Shot height={item.h} color={item.shotColor} label={item.shotLabel} />

          {item.size ? <SizePillBadge label={item.size} style={styles.sizeBadge} /> : null}

          <Pressable
            onPress={onToggleLike}
            hitSlop={8}
            style={styles.likeBtn}
            accessibilityLabel="Salva nel guardaroba"
          >
            <View pointerEvents="none" style={styles.likeShadow} />
            <View style={styles.likeInner}>
              <Text style={[styles.likeGlyph, { color: liked ? colors.pink : colors.muted }]}>
                {liked ? '♥' : '♡'}
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.brand} numberOfLines={1}>
            {item.brand}
          </Text>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: priceColor }]}>{item.price}</Text>
            {item.old ? <Text style={styles.oldPrice}>{item.old}</Text> : null}
          </View>

          {item.old ? <Stamp label="▼ price drop" color={colors.mint} style={styles.dropStamp} /> : null}
          {item.fit ? <Text style={styles.fitNote}>✓ {item.fit}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    top: shadowOffsets.window.y,
    left: shadowOffsets.window.x,
    right: -shadowOffsets.window.x,
    bottom: -shadowOffsets.window.y,
    backgroundColor: colors.ink,
    borderRadius: borders.radius.window,
  },
  card: {
    backgroundColor: colors.win,
    borderWidth: borders.width,
    borderColor: colors.ink,
    borderRadius: borders.radius.window,
    overflow: 'hidden',
  },
  shotArea: {
    position: 'relative',
  },
  sizeBadge: {
    position: 'absolute',
    top: 24,
    right: 7,
  },
  likeBtn: {
    position: 'absolute',
    top: 24,
    left: 7,
  },
  likeShadow: {
    position: 'absolute',
    top: shadowOffsets.button.y,
    left: shadowOffsets.button.x,
    right: -shadowOffsets.button.x,
    bottom: -shadowOffsets.button.y,
    backgroundColor: colors.ink,
    borderRadius: 4,
  },
  likeInner: {
    width: 30,
    height: 28,
    borderWidth: borders.width,
    borderColor: colors.ink,
    borderRadius: 4,
    backgroundColor: colors.win,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeGlyph: {
    fontSize: 15,
    lineHeight: 16,
  },
  info: {
    padding: 9,
    paddingBottom: 10,
    backgroundColor: colors.win,
  },
  name: {
    fontFamily: fonts.title,
    fontSize: 15,
    lineHeight: 16,
    color: colors.ink,
  },
  brand: {
    fontFamily: fonts.chrome,
    fontSize: 8,
    color: colors.muted,
    marginTop: 3,
    letterSpacing: 0.4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 7,
    marginTop: 7,
    flexWrap: 'wrap',
  },
  price: {
    fontFamily: fonts.body,
    fontSize: 22,
    lineHeight: 20,
  },
  oldPrice: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  dropStamp: {
    marginTop: 6,
  },
  fitNote: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.mint,
    marginTop: 5,
  },
});
