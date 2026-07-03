import {
  BattleOutfit,
  FeedItem,
  PriceTrackedItem,
  RateOutfit,
  ShareLinkOption,
  ShopEntry,
  WardrobeFolder,
} from './models';

// Stessi 6 capi del prototipo Reflct App.dc.html (static FEED).
export const FEED: FeedItem[] = [
  { id: 1, name: 'Giacca denim oversize', brand: 'ATELIER_9', size: 'M', price: '€79', old: '€110', h: 132, rot: -1.2, fit: 'fit ottimo', shotColor: '#4FD3E6', shotLabel: 'DENIM_01.BMP' },
  { id: 2, name: 'Slip dress raso', brand: 'MOTH&CO', size: 'S', price: '€54', old: null, h: 190, rot: 1.4, fit: null, shotColor: '#FF5FA2', shotLabel: 'DRESS_02.BMP' },
  { id: 3, name: 'Cargo pants Y2K', brand: 'RIP//STOP', size: 'L', price: '€65', old: '€89', h: 168, rot: 0, fit: null, shotColor: '#C6A5F2', shotLabel: 'CARGO_03.BMP' },
  { id: 4, name: 'Baby tee stampata', brand: 'CUTOUT', size: 'XS', price: '€28', old: null, h: 118, rot: -1.4, fit: 'fit ottimo', shotColor: '#F5D14E', shotLabel: 'TEE_04.BMP' },
  { id: 5, name: 'Maxi cardigan mohair', brand: 'NONNA_CLB', size: 'M', price: '€92', old: null, h: 176, rot: 1.1, fit: null, shotColor: '#2FAF8E', shotLabel: 'KNIT_05.BMP' },
  { id: 6, name: 'Gonna cargo midi', brand: 'RIP//STOP', size: 'S', price: '€48', old: '€60', h: 150, rot: 0, fit: null, shotColor: '#FF9EC7', shotLabel: 'SKIRT_06.BMP' },
];

export const FILTERS: string[] = ['Per te', 'Nuovi', 'Saldi', 'Denim', 'Vestiti', 'Vintage'];

export const WARDROBE_FOLDERS: WardrobeFolder[] = [
  { name: 'ESTATE', count: 12 },
  { name: 'LAVORO', count: 8 },
  { name: 'FESTA', count: 5 },
];

export const SHOP_ENTRIES: ShopEntry[] = [
  { name: 'Zara', icon: '🅩', url: 'https://www.zara.com/...' },
  { name: 'H&M', icon: '🅗', url: 'https://www2.hm.com/...' },
  { name: 'ASOS', icon: '🅐', url: 'https://www.asos.com/...' },
  { name: 'Zalando', icon: '🅩', url: 'https://www.zalando.it/...' },
];

export const SHARE_LINK_OPTIONS: ShareLinkOption[] = [
  { id: 'permanent', label: 'Link permanente' },
  { id: '24h', label: 'Link 24h' },
  { id: '7d', label: 'Link 7gg' },
  { id: '30d', label: 'Link 30gg' },
  { id: 'pin', label: 'Link con PIN' },
];

export const PRICE_TRACKED: PriceTrackedItem[] = [
  { ...FEED[0], history: [3, 5, 4, 6, 4, 3, 2, 2], isAllTimeLow: true, alertThreshold: 70 },
  { ...FEED[2], history: [6, 6, 5, 5, 4, 5, 4, 4], isAllTimeLow: false, alertThreshold: 60 },
  { ...FEED[5], history: [5, 4, 4, 3, 3, 2, 3, 2], isAllTimeLow: true, alertThreshold: null },
];

export const BATTLE_OUTFITS: [BattleOutfit, BattleOutfit] = [
  { id: 1, label: 'Look A', shotColor: '#4FD3E6', shotLabel: 'FIT_A.BMP', rot: -1, votes: 58 },
  { id: 2, label: 'Look B', shotColor: '#FF5FA2', shotLabel: 'FIT_B.BMP', rot: 1, votes: 42 },
];

export const RATE_OUTFITS: RateOutfit[] = [
  { id: 1, shotColor: '#C6A5F2', shotLabel: 'OOTD_01.BMP', fire: 124, meh: 12, skip: 4 },
];

export const TRENDING: FeedItem[] = [
  { id: 101, name: 'Bomber iridescente', brand: 'RIP//STOP', size: 'M', price: '€88', old: null, h: 160, rot: -0.8, fit: null, shotColor: '#4FD3E6', shotLabel: 'BOMB_01.BMP' },
  { id: 102, name: 'Vestito mesh Y2K', brand: 'MOTH&CO', size: 'S', price: '€61', old: null, h: 188, rot: 1.2, fit: null, shotColor: '#FF5FA2', shotLabel: 'MESH_02.BMP' },
  { id: 103, name: 'Pantaloni cargo lucidi', brand: 'CUTOUT', size: 'L', price: '€70', old: null, h: 150, rot: 0.5, fit: null, shotColor: '#F5D14E', shotLabel: 'CARGO_04.BMP' },
  { id: 104, name: 'Top a rete argento', brand: 'NONNA_CLB', size: 'XS', price: '€35', old: null, h: 120, rot: -1.1, fit: null, shotColor: '#2FAF8E', shotLabel: 'TOP_05.BMP' },
];
