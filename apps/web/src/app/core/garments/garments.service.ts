import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  GarmentItemResponse,
  Page,
  PriceHistoryPointResponse,
  ToggleFavoriteResponse,
  WardrobeItemResponse,
} from './models';

/** Client verso com.reflct.api.garment / com.reflct.api.wardrobe. */
@Injectable({ providedIn: 'root' })
export class GarmentsService {
  private readonly http = inject(HttpClient);

  listGarments(): Observable<Page<GarmentItemResponse>> {
    return this.http.get<Page<GarmentItemResponse>>(`${environment.apiUrl}/garments`);
  }

  toggleFavorite(garmentId: string): Observable<ToggleFavoriteResponse> {
    return this.http.post<ToggleFavoriteResponse>(`${environment.apiUrl}/gallery/${garmentId}/toggle-favorite`, {});
  }

  getGallery(): Observable<Page<WardrobeItemResponse>> {
    return this.http.get<Page<WardrobeItemResponse>>(`${environment.apiUrl}/gallery`);
  }

  getPriceHistory(garmentId: string): Observable<PriceHistoryPointResponse[]> {
    return this.http.get<PriceHistoryPointResponse[]>(`${environment.apiUrl}/garments/${garmentId}/price-history`);
  }

  importGarment(url: string): Observable<GarmentItemResponse> {
    return this.http.post<GarmentItemResponse>(`${environment.apiUrl}/garments/import`, { url });
  }
}
