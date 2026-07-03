// Rispecchia i DTO reali di backend/api (com.reflct.api.garment / com.reflct.api.wardrobe).

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
  /** Prezzo storico piu' alto (da price_history), solo se > prezzoAttuale — alimenta il badge price-drop. */
  prezzoPrecedente: number | null;
  /** true se gia' nel guardaroba dell'utente corrente. */
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

/** Forma di org.springframework.data.domain.Page nel JSON di risposta. */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/** Punto di storico prezzo (com.reflct.api.garment.PriceHistoryPointResponse). */
export interface PriceHistoryPointResponse {
  prezzo: number;
  rilevatoAt: string;
}

/** Alert soglia prezzo (com.reflct.api.pricetracker.PriceAlertResponse). */
export interface PriceAlertResponse {
  id: string;
  garmentId: string;
  soglia: number;
  active: boolean;
  triggeredAt: string | null;
  createdAt: string;
}
