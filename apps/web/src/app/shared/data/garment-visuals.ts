// I capi REALI (da GET /api/v1/garments) non hanno campi "shotColor"/"rot"/"h":
// sono puramente presentazionali (placeholder dithered, altezza masonry,
// rotazione collage) e non ha senso persisterli lato backend. Li deriviamo qui
// in modo deterministico dall'id del capo, cosi' la stessa card ha sempre lo
// stesso aspetto invece di "saltare" ad ogni reload.
import { FeedItem } from './models';
import { GarmentItemResponse } from '../../core/garments/models';

const PALETTE = ['#4FD3E6', '#FF5FA2', '#C6A5F2', '#F5D14E', '#2FAF8E', '#F5A03D', '#FF9EC7'];

function hashString(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function deriveShotColor(id: string): string {
  return PALETTE[hashString(id) % PALETTE.length];
}

function deriveRot(id: string): number {
  // -1.4 .. 1.4 gradi, in passi di 0.1 (coerente col range del design system).
  return ((hashString(id) % 29) - 14) / 10;
}

function deriveHeight(id: string): number {
  return 118 + (hashString(id) % 8) * 10; // 118..188px
}

function formatPrice(value: number | null): string {
  return value != null ? `€${Math.round(value)}` : '';
}

function deriveShotLabel(nome: string): string {
  const slug = nome
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 12);
  return `${slug || 'ITEM'}.BMP`;
}

/**
 * Converte un GarmentItemResponse reale in un FeedItem per i componenti UI
 * condivisi (app-feed-card ecc.), che restano invariati sia per dati mock che reali.
 */
export function toFeedItem(garment: GarmentItemResponse): FeedItem {
  return {
    id: garment.id,
    name: garment.nome,
    brand: garment.brand,
    size: null,
    price: formatPrice(garment.prezzoAttuale),
    old: garment.prezzoPrecedente != null ? formatPrice(garment.prezzoPrecedente) : null,
    h: deriveHeight(garment.id),
    rot: deriveRot(garment.id),
    fit: null,
    shotColor: deriveShotColor(garment.id),
    shotLabel: deriveShotLabel(garment.nome),
  };
}
