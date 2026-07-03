// Mock data — stesso set del prototipo HTML (docs/design-reference/Reflct App.dc.html).
import {
  FeedItem,
  WardrobeFolder,
  PriceWatchItem,
  ShopLink,
  ShareLinkOption,
  BattlePair,
  TrendingItem,
} from './models';

export const FEED: FeedItem[] = [
  { id: 1, name: 'Giacca denim oversize', brand: 'ATELIER_9', size: 'M', price: '€79', old: '€110', h: 132, rot: -1.2, fit: 'fit ottimo', shotColor: '#4FD3E6', shotLabel: 'DENIM_01.BMP' },
  { id: 2, name: 'Slip dress raso', brand: 'MOTH&CO', size: 'S', price: '€54', old: null, h: 190, rot: 1.4, fit: null, shotColor: '#FF5FA2', shotLabel: 'DRESS_02.BMP' },
  { id: 3, name: 'Cargo pants Y2K', brand: 'RIP//STOP', size: 'L', price: '€65', old: '€89', h: 168, rot: 0, fit: null, shotColor: '#C6A5F2', shotLabel: 'CARGO_03.BMP' },
  { id: 4, name: 'Baby tee stampata', brand: 'CUTOUT', size: 'XS', price: '€28', old: null, h: 118, rot: -1.4, fit: 'fit ottimo', shotColor: '#F5D14E', shotLabel: 'TEE_04.BMP' },
  { id: 5, name: 'Maxi cardigan mohair', brand: 'NONNA_CLB', size: 'M', price: '€92', old: null, h: 176, rot: 1.1, fit: null, shotColor: '#2FAF8E', shotLabel: 'KNIT_05.BMP' },
  { id: 6, name: 'Gonna cargo midi', brand: 'RIP//STOP', size: 'S', price: '€48', old: '€60', h: 150, rot: 0, fit: null, shotColor: '#FF9EC7', shotLabel: 'SKIRT_06.BMP' },
];

export const FILTERS = ['Per te', 'Nuovi', 'Saldi', 'Denim', 'Vestiti', 'Vintage'] as const;

export const SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const;

export const TRYON_COLORS = ['#FF5FA2', '#4FD3E6', '#2FAF8E', '#F5D14E', '#C6A5F2'];

export const WARDROBE_FOLDERS: WardrobeFolder[] = [
  { id: 'estate', label: 'ESTATE', count: 12 },
  { id: 'lavoro', label: 'LAVORO', count: 8 },
  { id: 'festa', label: 'FESTA', count: 5 },
];

export const SHOP_LINKS: ShopLink[] = [
  { id: 'zara', name: 'Zara' },
  { id: 'hm', name: 'H&M' },
  { id: 'asos', name: 'ASOS' },
  { id: 'zalando', name: 'Zalando' },
];

export const SHARE_LINK_OPTIONS: ShareLinkOption[] = [
  { id: 'permanent', label: 'Link permanente' },
  { id: '24h', label: 'Link 24h' },
  { id: '7d', label: 'Link 7gg' },
  { id: '30d', label: 'Link 30gg' },
  { id: 'pin', label: 'Link con PIN' },
];

export const BATTLE_PAIR: BattlePair = {
  id: 'battle-1',
  itemAName: 'Giacca denim oversize',
  itemBName: 'Maxi cardigan mohair',
  votesA: 62,
  votesB: 38,
  countdown: '23:41:02',
};

export const TRENDING: TrendingItem[] = [
  { id: 't1', name: 'Giacca denim oversize', shotColor: '#4FD3E6', fireCount: 124 },
  { id: 't2', name: 'Slip dress raso', shotColor: '#FF5FA2', fireCount: 98 },
  { id: 't3', name: 'Cargo pants Y2K', shotColor: '#C6A5F2', fireCount: 77 },
  { id: 't4', name: 'Maxi cardigan mohair', shotColor: '#2FAF8E', fireCount: 61 },
];

export const PRICE_WATCH: PriceWatchItem[] = [
  { id: 1, feedItemId: 1, sparkline: [0.6, 0.7, 0.5, 0.4, 0.35, 0.3, 0.32, 0.28], isHistoricLow: true, alertThreshold: 70 },
  { id: 2, feedItemId: 3, sparkline: [0.4, 0.45, 0.5, 0.55, 0.5, 0.48, 0.46, 0.5], isHistoricLow: false, alertThreshold: 60 },
  { id: 3, feedItemId: 6, sparkline: [0.8, 0.75, 0.6, 0.5, 0.45, 0.4, 0.42, 0.38], isHistoricLow: true, alertThreshold: null },
];

export const PROFILE_STATS = {
  triedOn: 42,
  looks: 7,
  saved: 0, // sovrascritto a runtime dal conteggio like reale
};
