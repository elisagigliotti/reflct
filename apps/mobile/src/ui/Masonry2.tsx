// .masonry-2 — griglia masonry 2 colonne. RN non ha CSS columns: si simula
// distribuendo gli item alternati in due colonne verticali (approssimazione
// masonry ragionevole senza librerie esterne).
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../theme/theme';

interface Masonry2Props<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

export default function Masonry2<T>({ data, renderItem, keyExtractor }: Masonry2Props<T>) {
  const colA: T[] = [];
  const colB: T[] = [];
  data.forEach((item, i) => (i % 2 === 0 ? colA : colB).push(item));

  return (
    <View style={styles.row}>
      <View style={styles.col}>
        {colA.map((item) => (
          <View key={keyExtractor(item)} style={styles.cell}>
            {renderItem(item, data.indexOf(item))}
          </View>
        ))}
      </View>
      <View style={styles.col}>
        {colB.map((item) => (
          <View key={keyExtractor(item)} style={styles.cell}>
            {renderItem(item, data.indexOf(item))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.masonryColumnGap,
  },
  col: {
    flex: 1,
  },
  cell: {
    marginBottom: spacing.blockGap,
  },
});
