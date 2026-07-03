// Modelli TS condivisi tra le schermate (Feed/Prova/Armadio/Import/Battle/...).

/**
 * `id` e' string per i capi reali (UUID da backend/api) o number per i mock
 * ancora in uso in Import/Social/Share/Price Tracker. `size`/`fit` opzionali
 * perche' i dati reali non li forniscono ancora (vedi data/garmentVisuals.ts).
 */
export interface FeedItem {
  id: string | number;
  name: string;
  brand: string;
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  price: string;
  old: string | null;
  h: number; // altezza scatto placeholder (px)
  rot: number; // gradi rotazione collage (-1.4..1.4)
  fit: string | null; // es. 'fit ottimo'
  shotColor: string;
  shotLabel: string; // es. 'DENIM_01.BMP'
}

export interface WardrobeFolder {
  id: string;
  label: string;
  count: number;
}

export interface PriceWatchItem {
  id: number;
  feedItemId: number;
  sparkline: number[]; // 8 valori 0..1
  isHistoricLow: boolean;
  alertThreshold: number | null;
}

export interface ShopLink {
  id: string;
  name: string;
}

export interface ShareLinkOption {
  id: string;
  label: string;
}

export interface BattlePair {
  id: string;
  itemAName: string;
  itemBName: string;
  votesA: number;
  votesB: number;
  countdown: string;
}

export interface TrendingItem {
  id: string;
  name: string;
  shotColor: string;
  fireCount: number;
}
