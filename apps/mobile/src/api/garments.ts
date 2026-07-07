// Rispecchia i DTO reali di backend/api (com.reflct.api.garment / com.reflct.api.wardrobe).
// Stessa forma di apps/web/src/app/core/garments/*.
import { api } from './client';

export interface GarmentItemResponse {
  id: string;
  urlOriginale: string;
  nome: string;
  brand: string;
  categoria: string | null;
  prezzoAttuale: number | null;
  prezzoStoricoJson: string | null;
  fotoFrontUrl: string | null;
  fotoBackUrl: string | null;
  misureTaglieJson: string | null;
  sourceDomain: string | null;
  createdAt: string;
  prezzoPrecedente: number | null;
  preferito: boolean;
}

export interface WardrobeItemResponse {
  id: string;
  garmentId: string;
  garmentNome: string;
  garmentBrand: string;
  garmentPrezzoAttuale: number | null;
  garmentFotoFrontUrl: string | null;
  sessionId: string | null;
  categoria: string | null;
  categoriaCustom: string | null;
  capsuleId: string | null;
  note: string | null;
  favorite: boolean;
  createdAt: string;
}

export interface ToggleFavoriteResponse {
  liked: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export function listGarments(): Promise<Page<GarmentItemResponse>> {
  return api.get<Page<GarmentItemResponse>>('/garments');
}

export function toggleFavorite(garmentId: string): Promise<ToggleFavoriteResponse> {
  return api.post<ToggleFavoriteResponse>(`/gallery/${garmentId}/toggle-favorite`, {});
}

export function getGallery(): Promise<Page<WardrobeItemResponse>> {
  return api.get<Page<WardrobeItemResponse>>('/gallery');
}

export interface PriceHistoryPointResponse {
  data: string;
  prezzo: number;
}

export function importGarment(url: string): Promise<GarmentItemResponse> {
  return api.post<GarmentItemResponse>('/garments/import', { url });
}

export function getPriceHistory(garmentId: string): Promise<PriceHistoryPointResponse[]> {
  return api.get<PriceHistoryPointResponse[]>(`/garments/${garmentId}/price-history`);
}
