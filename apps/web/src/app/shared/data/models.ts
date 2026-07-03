// ==========================================================================
// Modelli dati condivisi — Reflct
// Rispecchia lo stato/dati mock descritto in docs/design-reference/README.md
// (sezione "State Management") e nel prototipo Reflct App.dc.html.
// ==========================================================================

/**
 * Capo del feed / masonry (Feed, Armadio, Import, Price Tracker).
 * `id` e' `string` per i capi reali (UUID da backend/api) o `number` per i mock
 * ancora in uso in Import/Social/Share/Price Tracker. `size`/`fit` sono opzionali
 * perche' i dati reali non li forniscono ancora (vedi shared/data/garment-visuals.ts).
 */
export interface FeedItem {
  id: string | number;
  name: string;
  brand: string;
  size?: string | null;
  price: string;
  old: string | null;
  /** altezza scatto in px, guida il masonry (placeholder dithered). */
  h: number;
  /** rotazione collage in gradi, CSS var --rot (-1.4 .. 1.4). */
  rot: number;
  /** nota fit ("fit ottimo") oppure null. */
  fit: string | null;
  /** colore di sfondo del placeholder .shot */
  shotColor: string;
  /** etichetta stampata sul placeholder, es. DENIM_01.BMP */
  shotLabel: string;
}

export interface NavItem {
  key: 'Feed' | 'Prova' | 'Armadio' | 'Io';
  icon: string;
  label: string;
  path: string;
}

export interface FilterOption {
  label: string;
}

/** Cartella guardaroba (Armadio). */
export interface WardrobeFolder {
  name: string;
  count: number;
}

/** Voce shop popolare (Import). */
export interface ShopEntry {
  name: string;
  icon: string;
  url: string;
}

/** Opzione link condivisione (Share). */
export interface ShareLinkOption {
  id: string;
  label: string;
}

/** Item monitorato dal price tracker. */
export interface PriceTrackedItem extends FeedItem {
  history: number[]; // valori per sparkline (8 barre)
  isAllTimeLow: boolean;
  alertThreshold: number | null;
}

/** Outfit per Battle/Social. */
export interface BattleOutfit {
  id: number;
  label: string;
  shotColor: string;
  shotLabel: string;
  rot: number;
  votes: number;
}

/** Item "Rate my outfit". */
export interface RateOutfit {
  id: number;
  shotColor: string;
  shotLabel: string;
  fire: number;
  meh: number;
  skip: number;
}
